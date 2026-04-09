require('dotenv').config();

const bcrypt = require('bcryptjs');
const {
  AccountStatus,
  BookingStatus,
  NotificationType,
  PrismaClient,
  ShipmentStatus,
  TripStatus,
  TripStopStatus,
  TripStopType,
  TruckStatus,
  UserRole,
} = require('../generated/prisma');
const prisma = new PrismaClient();

const seedUsers = [
  {
    email: 'warehouse@trucksetu.dev',
    password: 'Warehouse123',
    name: 'Surat Hub',
    phone: '9876543210',
    role: UserRole.WAREHOUSE,
    profileComplete: true,
    warehouse: {
      warehouseName: 'Surat Central Warehouse',
      city: 'Surat',
      address: 'Ring Road Logistics Zone, Surat',
    },
  },
  {
    email: 'dealer@trucksetu.dev',
    password: 'Dealer123',
    name: 'Roadlink Transport',
    phone: '9876501234',
    role: UserRole.DEALER,
    profileComplete: true,
    truckDealer: {
      companyName: 'Roadlink Transport',
      primaryCity: 'Ahmedabad',
      baseRatePerKmTon: 24,
    },
  },
  {
    email: 'admin@trucksetu.dev',
    password: 'Admin123',
    name: 'Platform Admin',
    phone: '9999999999',
    role: UserRole.ADMIN,
    profileComplete: true,
  },
];

const seedTrucks = [
  {
    registrationNo: 'GJ05TSETU1001',
    truckType: 'Heavy Truck',
    maxWeightKg: 16000,
    maxVolumeM3: 65,
    emissionFactor: 2.68,
    fuelEfficiency: 4,
    currentCity: 'Ahmedabad',
    status: TruckStatus.AVAILABLE,
    isActive: true,
  },
  {
    registrationNo: 'GJ01TSETU2002',
    truckType: 'Container Truck',
    maxWeightKg: 22000,
    maxVolumeM3: 82,
    emissionFactor: 2.72,
    fuelEfficiency: 3.6,
    currentCity: 'Vadodara',
    status: TruckStatus.AVAILABLE,
    isActive: true,
  },
  {
    registrationNo: 'MH04TSETU3003',
    truckType: 'Reefer Truck',
    maxWeightKg: 12000,
    maxVolumeM3: 48,
    emissionFactor: 2.61,
    fuelEfficiency: 4.4,
    currentCity: 'Mumbai',
    status: TruckStatus.MAINTENANCE,
    isActive: true,
  },
];

const seedShipments = [
  {
    referenceNo: 'STL-SHP-1001',
    title: 'Ahmedabad Retail Replenishment',
    description: 'Seeded delivered shipment for analytics and trip history.',
    weightKg: 6800,
    volumeM3: 32,
    originCity: 'Surat',
    originAddress: 'Ring Road Logistics Zone, Surat',
    originLat: 21.1702,
    originLng: 72.8311,
    destCity: 'Ahmedabad',
    destAddress: 'Narol Distribution Market, Ahmedabad',
    destLat: 23.0225,
    destLng: 72.5714,
    deadline: new Date('2026-04-05T12:00:00.000Z'),
    priority: 2,
    status: ShipmentStatus.DELIVERED,
    specialInstructions: 'Handle cartons carefully during unloading.',
  },
  {
    referenceNo: 'STL-SHP-1002',
    title: 'Vadodara Paint Components',
    description: 'Seeded pending shipment ready for booking.',
    weightKg: 4200,
    volumeM3: 18,
    originCity: 'Surat',
    originAddress: 'Ring Road Logistics Zone, Surat',
    originLat: 21.1702,
    originLng: 72.8311,
    destCity: 'Vadodara',
    destAddress: 'Makarpura Industrial Estate, Vadodara',
    destLat: 22.3072,
    destLng: 73.1812,
    deadline: new Date('2026-04-08T08:00:00.000Z'),
    priority: 3,
    status: ShipmentStatus.PENDING,
    specialInstructions: 'Priority delivery for production line restock.',
  },
  {
    referenceNo: 'STL-SHP-1003',
    title: 'Mumbai Demo Stock',
    description: 'Seeded draft shipment for dashboard distribution.',
    weightKg: 5300,
    volumeM3: 24,
    originCity: 'Surat',
    originAddress: 'Ring Road Logistics Zone, Surat',
    originLat: 21.1702,
    originLng: 72.8311,
    destCity: 'Mumbai',
    destAddress: 'Bhiwandi Warehousing Cluster, Mumbai',
    destLat: 19.076,
    destLng: 72.8777,
    deadline: new Date('2026-04-12T10:30:00.000Z'),
    priority: 1,
    status: ShipmentStatus.DRAFT,
    fragile: true,
    specialInstructions: 'Keep stacked pallets upright.',
  },
];

const seedNotifications = [
  {
    type: NotificationType.BOOKING,
    title: 'Seed booking approved',
    message: 'A delivered seed booking keeps analytics and detail pages populated.',
    link: '/dealer/bookings',
  },
  {
    type: NotificationType.SYSTEM,
    title: 'Phase 2 baseline ready',
    message: 'Persistent auth sessions and Prisma migrations are now available.',
    link: '/status',
  },
];

async function main() {
  let warehouseUser;
  let dealerUser;

  for (const item of seedUsers) {
    const passwordHash = await bcrypt.hash(item.password, 10);

    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: {
        name: item.name,
        phone: item.phone,
        role: item.role,
        accountStatus: AccountStatus.ACTIVE,
        profileComplete: item.profileComplete,
        isEmailVerified: true,
        passwordHash,
      },
      create: {
        email: item.email,
        name: item.name,
        phone: item.phone,
        role: item.role,
        accountStatus: AccountStatus.ACTIVE,
        profileComplete: item.profileComplete,
        isEmailVerified: true,
        passwordHash,
      },
    });

    if (item.warehouse) {
      await prisma.warehouse.upsert({
        where: { userId: user.id },
        update: item.warehouse,
        create: {
          userId: user.id,
          ...item.warehouse,
        },
      });
      warehouseUser = user;
    }

    if (item.truckDealer) {
      await prisma.truckDealer.upsert({
        where: { userId: user.id },
        update: item.truckDealer,
        create: {
          userId: user.id,
          ...item.truckDealer,
        },
      });
      dealerUser = user;
    }
  }

  const warehouse = await prisma.warehouse.findUnique({
    where: { userId: warehouseUser.id },
  });
  const dealer = await prisma.truckDealer.findUnique({
    where: { userId: dealerUser.id },
  });

  for (const truck of seedTrucks) {
    await prisma.truck.upsert({
      where: { registrationNo: truck.registrationNo },
      update: {
        dealerId: dealer.id,
        ...truck,
      },
      create: {
        dealerId: dealer.id,
        ...truck,
      },
    });
  }

  const seededShipmentRecords = [];

  for (const shipment of seedShipments) {
    const record = await prisma.shipment.upsert({
      where: { referenceNo: shipment.referenceNo },
      update: {
        warehouseId: warehouse.id,
        createdById: warehouseUser.id,
        ...shipment,
      },
      create: {
        warehouseId: warehouse.id,
        createdById: warehouseUser.id,
        ...shipment,
      },
    });

    seededShipmentRecords.push(record);
  }

  const deliveredTruck = await prisma.truck.findUnique({
    where: { registrationNo: 'GJ01TSETU2002' },
  });

  const deliveredBookingNote = 'Seeded approved booking for analytics coverage';
  let deliveredBooking = await prisma.bookingRequest.findFirst({
    where: {
      truckId: deliveredTruck.id,
      warehouseNote: deliveredBookingNote,
      shipments: {
        some: {
          shipmentId: seededShipmentRecords[0].id,
        },
      },
    },
  });

  if (!deliveredBooking) {
    deliveredBooking = await prisma.bookingRequest.create({
      data: {
        warehouseId: warehouse.id,
        requestedById: warehouseUser.id,
        truckId: deliveredTruck.id,
        status: BookingStatus.APPROVED,
        quotedPrice: 38250,
        finalPrice: 37500,
        warehouseNote: deliveredBookingNote,
        dealerNote: 'Approved during seed setup for analytics and tracking demos.',
        respondedAt: new Date('2026-04-03T08:15:00.000Z'),
        approvedAt: new Date('2026-04-03T08:15:00.000Z'),
        shipments: {
          create: [
            {
              shipmentId: seededShipmentRecords[0].id,
            },
          ],
        },
      },
    });
  }

  const deliveredTrip = await prisma.trip.upsert({
    where: { bookingRequestId: deliveredBooking.id },
    update: {
      truckId: deliveredTruck.id,
      dealerId: dealer.id,
      status: TripStatus.DELIVERED,
      estimatedDistanceKm: 275,
      estimatedDurationMin: 345,
      estimatedCost: 37500,
      actualCost: 36800,
      baselineCo2Kg: 820,
      tripCo2Kg: 755,
      co2SavedKg: 65,
      startedAt: new Date('2026-04-03T10:00:00.000Z'),
      completedAt: new Date('2026-04-03T16:20:00.000Z'),
    },
    create: {
      bookingRequestId: deliveredBooking.id,
      truckId: deliveredTruck.id,
      dealerId: dealer.id,
      status: TripStatus.DELIVERED,
      estimatedDistanceKm: 275,
      estimatedDurationMin: 345,
      estimatedCost: 37500,
      actualCost: 36800,
      baselineCo2Kg: 820,
      tripCo2Kg: 755,
      co2SavedKg: 65,
      startedAt: new Date('2026-04-03T10:00:00.000Z'),
      completedAt: new Date('2026-04-03T16:20:00.000Z'),
    },
  });

  await prisma.tripShipment.upsert({
    where: {
      tripId_shipmentId: {
        tripId: deliveredTrip.id,
        shipmentId: seededShipmentRecords[0].id,
      },
    },
    update: {
      loadedAt: new Date('2026-04-03T10:20:00.000Z'),
      deliveredAt: new Date('2026-04-03T16:10:00.000Z'),
    },
    create: {
      tripId: deliveredTrip.id,
      shipmentId: seededShipmentRecords[0].id,
      loadedAt: new Date('2026-04-03T10:20:00.000Z'),
      deliveredAt: new Date('2026-04-03T16:10:00.000Z'),
    },
  });

  await prisma.tripStop.deleteMany({
    where: { tripId: deliveredTrip.id },
  });

  await prisma.tripStop.createMany({
    data: [
      {
        tripId: deliveredTrip.id,
        shipmentId: seededShipmentRecords[0].id,
        sequence: 1,
        type: TripStopType.PICKUP,
        status: TripStopStatus.COMPLETED,
        city: 'Surat',
        address: 'Ring Road Logistics Zone, Surat',
        lat: 21.1702,
        lng: 72.8311,
        plannedArrival: new Date('2026-04-03T10:00:00.000Z'),
        arrivedAt: new Date('2026-04-03T10:05:00.000Z'),
        completedAt: new Date('2026-04-03T10:20:00.000Z'),
        notes: 'Seed pickup completed.',
      },
      {
        tripId: deliveredTrip.id,
        shipmentId: seededShipmentRecords[0].id,
        sequence: 2,
        type: TripStopType.DELIVERY,
        status: TripStopStatus.COMPLETED,
        city: 'Ahmedabad',
        address: 'Narol Distribution Market, Ahmedabad',
        lat: 23.0225,
        lng: 72.5714,
        plannedArrival: new Date('2026-04-03T16:00:00.000Z'),
        arrivedAt: new Date('2026-04-03T16:00:00.000Z'),
        completedAt: new Date('2026-04-03T16:10:00.000Z'),
        notes: 'Seed delivery completed.',
      },
    ],
  });

  await prisma.tripLocation.deleteMany({
    where: { tripId: deliveredTrip.id },
  });

  await prisma.tripLocation.createMany({
    data: [
      {
        tripId: deliveredTrip.id,
        truckId: deliveredTruck.id,
        lat: 21.1702,
        lng: 72.8311,
        speed: 0,
        heading: 0,
        source: 'seed',
        recordedAt: new Date('2026-04-03T10:00:00.000Z'),
      },
      {
        tripId: deliveredTrip.id,
        truckId: deliveredTruck.id,
        lat: 22.3072,
        lng: 73.1812,
        speed: 58,
        heading: 15,
        source: 'seed',
        recordedAt: new Date('2026-04-03T13:10:00.000Z'),
      },
      {
        tripId: deliveredTrip.id,
        truckId: deliveredTruck.id,
        lat: 23.0225,
        lng: 72.5714,
        speed: 0,
        heading: 0,
        source: 'seed',
        recordedAt: new Date('2026-04-03T16:10:00.000Z'),
      },
    ],
  });

  await prisma.truck.update({
    where: { id: deliveredTruck.id },
    data: {
      status: TruckStatus.AVAILABLE,
      currentCity: 'Ahmedabad',
    },
  });

  await prisma.notification.deleteMany({
    where: {
      userId: {
        in: [warehouseUser.id, dealerUser.id],
      },
      title: {
        in: seedNotifications.map((item) => item.title),
      },
    },
  });

  await prisma.notification.createMany({
    data: seedNotifications.flatMap((notification) => [
      {
        userId: warehouseUser.id,
        ...notification,
      },
      {
        userId: dealerUser.id,
        ...notification,
      },
    ]),
  });

  await prisma.refreshSession.deleteMany({
    where: {
      userId: {
        in: [warehouseUser.id, dealerUser.id],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed completed successfully.');
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
