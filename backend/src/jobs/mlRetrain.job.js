const cron = require('node-cron');
const axios = require('axios');

const prisma = require('../config/db');
const { ML_RETRAIN_CRON, PYTHON_ML_URL } = require('../config/env');
const notificationService = require('../services/notification.service');

let mlRetrainTask = null;

async function triggerMLRetrain(options = {}) {
  const client =
    options.client ||
    axios.create({
      baseURL: PYTHON_ML_URL,
      timeout: 10000,
    });
  const prismaClient = options.prismaClient || prisma;
  const notifier = options.notifier || notificationService;

  try {
    const response = await client.post('/internal/retrain');
    return {
      ok: true,
      data: response.data,
    };
  } catch (error) {
    const admins = await prismaClient.user.findMany({
      where: {
        role: 'ADMIN',
        accountStatus: 'ACTIVE',
      },
      select: {
        id: true,
      },
    });

    await Promise.all(
      admins.map((admin) =>
        notifier.sendNotification({
          userId: admin.id,
          type: 'ADMIN',
          title: 'ML retrain failed',
          message: `Scheduled ML retraining failed: ${error.message}`,
          link: '/admin/analytics',
          metadata: {
            source: 'ml-retrain-job',
          },
        })
      )
    );

    return {
      ok: false,
      error: error.message,
    };
  }
}

function startMLRetrainJob() {
  if (mlRetrainTask) {
    return mlRetrainTask;
  }

  mlRetrainTask = cron.schedule(ML_RETRAIN_CRON, () => {
    triggerMLRetrain().catch((error) => {
      console.warn(`[ml-retrain-job] ${error.message}`);
    });
  });

  return mlRetrainTask;
}

function stopMLRetrainJob() {
  mlRetrainTask?.stop();
  mlRetrainTask = null;
}

module.exports = {
  startMLRetrainJob,
  stopMLRetrainJob,
  triggerMLRetrain,
};
