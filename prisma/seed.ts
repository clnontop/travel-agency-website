import { PrismaClient, UserRole, VehicleType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data
  await prisma.notification.deleteMany()
  await prisma.review.deleteMany()
  await prisma.tracking.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.driverEarning.deleteMany()
  await prisma.document.deleteMany()
  await prisma.address.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.admin.deleteMany()
  await prisma.oTPSession.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Cleaned existing data')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@trinck.com',
      password: adminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      phoneVerified: new Date(),
      phone: '+919876543210',
      adminProfile: {
        create: {
          department: 'Operations',
          permissions: JSON.stringify(['all']),
        },
      },
    },
  })

  console.log('✅ Created admin user')

  // Create test customers
  const customerPassword = await bcrypt.hash('customer123', 12)
  const customers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        password: customerPassword,
        name: 'John Doe',
        role: UserRole.CUSTOMER,
        phone: '+919876543211',
        emailVerified: new Date(),
        phoneVerified: new Date(),
        customerProfile: {
          create: {
            walletBalance: 5000,
            savedAddresses: {
              create: [
                {
                  label: 'Home',
                  address: '123 MG Road',
                  city: 'Mumbai',
                  state: 'Maharashtra',
                  pincode: '400001',
                  lat: 19.0760,
                  lng: 72.8777,
                  isDefault: true,
                },
                {
                  label: 'Office',
                  address: '456 Brigade Road',
                  city: 'Bangalore',
                  state: 'Karnataka',
                  pincode: '560001',
                  lat: 12.9716,
                  lng: 77.5946,
                },
              ],
            },
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        password: customerPassword,
        name: 'Jane Smith',
        role: UserRole.CUSTOMER,
        phone: '+919876543212',
        emailVerified: new Date(),
        customerProfile: {
          create: {
            walletBalance: 10000,
            savedAddresses: {
              create: {
                label: 'Home',
                address: '789 Connaught Place',
                city: 'New Delhi',
                state: 'Delhi',
                pincode: '110001',
                lat: 28.6139,
                lng: 77.2090,
                isDefault: true,
              },
            },
          },
        },
      },
    }),
  ])

  console.log('✅ Created test customers')

  // Create test drivers
  const driverPassword = await bcrypt.hash('driver123', 12)
  const drivers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'rajesh.kumar@example.com',
        password: driverPassword,
        name: 'Rajesh Kumar',
        role: UserRole.DRIVER,
        phone: '+919876543213',
        emailVerified: new Date(),
        phoneVerified: new Date(),
        driverProfile: {
          create: {
            vehicleType: VehicleType.TRUCK,
            vehicleNumber: 'MH01AB1234',
            vehicleBrand: 'Tata',
            vehicleModel: 'Prima',
            vehicleYear: 2022,
            vehicleCapacity: 15,
            licenseNumber: 'MH1234567890',
            licenseExpiry: new Date('2025-12-31'),
            insuranceNumber: 'INS123456',
            insuranceExpiry: new Date('2024-12-31'),
            currentLat: 19.0760,
            currentLng: 72.8777,
            isOnline: true,
            isAvailable: true,
            walletBalance: 25000,
            totalEarnings: 150000,
            rating: 4.8,
            totalTrips: 127,
            isVerified: true,
            verifiedAt: new Date(),
            documents: {
              create: [
                {
                  type: 'LICENSE',
                  url: 'https://example.com/license.pdf',
                  status: 'VERIFIED',
                  verifiedAt: new Date(),
                },
                {
                  type: 'INSURANCE',
                  url: 'https://example.com/insurance.pdf',
                  status: 'VERIFIED',
                  verifiedAt: new Date(),
                },
              ],
            },
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'amit.sharma@example.com',
        password: driverPassword,
        name: 'Amit Sharma',
        role: UserRole.DRIVER,
        phone: '+919876543214',
        emailVerified: new Date(),
        phoneVerified: new Date(),
        driverProfile: {
          create: {
            vehicleType: VehicleType.MINI_TRUCK,
            vehicleNumber: 'DL02CD5678',
            vehicleBrand: 'Mahindra',
            vehicleModel: 'Bolero Pickup',
            vehicleYear: 2023,
            vehicleCapacity: 2,
            licenseNumber: 'DL9876543210',
            licenseExpiry: new Date('2026-06-30'),
            currentLat: 28.6139,
            currentLng: 77.2090,
            isOnline: true,
            isAvailable: true,
            walletBalance: 15000,
            totalEarnings: 80000,
            rating: 4.6,
            totalTrips: 89,
            isVerified: true,
            verifiedAt: new Date(),
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'suresh.patel@example.com',
        password: driverPassword,
        name: 'Suresh Patel',
        role: UserRole.DRIVER,
        phone: '+919876543215',
        emailVerified: new Date(),
        driverProfile: {
          create: {
            vehicleType: VehicleType.CONTAINER,
            vehicleNumber: 'GJ03EF9012',
            vehicleBrand: 'Volvo',
            vehicleModel: 'FH16',
            vehicleYear: 2021,
            vehicleCapacity: 40,
            licenseNumber: 'GJ5432109876',
            licenseExpiry: new Date('2025-09-30'),
            insuranceNumber: 'INS789012',
            insuranceExpiry: new Date('2024-09-30'),
            currentLat: 23.0225,
            currentLng: 72.5714,
            isOnline: false,
            isAvailable: false,
            walletBalance: 45000,
            totalEarnings: 320000,
            rating: 4.9,
            totalTrips: 203,
            isVerified: true,
            verifiedAt: new Date(),
          },
        },
      },
    }),
  ])

  console.log('✅ Created test drivers')

  // Create sample bookings
  const customer1 = await prisma.customer.findFirst({
    where: { user: { email: 'john.doe@example.com' } },
  })
  
  const driver1 = await prisma.driver.findFirst({
    where: { user: { email: 'rajesh.kumar@example.com' } },
  })

  if (customer1 && driver1) {
    const booking = await prisma.booking.create({
      data: {
        customerId: customer1.id,
        driverId: driver1.id,
        pickupAddress: '123 MG Road, Mumbai',
        pickupLat: 19.0760,
        pickupLng: 72.8777,
        dropAddress: '456 Brigade Road, Bangalore',
        dropLat: 12.9716,
        dropLng: 77.5946,
        distance: 985,
        duration: 960,
        cargoType: 'Electronics',
        cargoWeight: 5,
        cargoDescription: 'Fragile electronic equipment',
        basePrice: 5000,
        distancePrice: 9850,
        weightPrice: 2500,
        totalPrice: 17350,
        status: 'COMPLETED',
        scheduledAt: new Date('2024-01-15T10:00:00'),
        acceptedAt: new Date('2024-01-15T10:15:00'),
        startedAt: new Date('2024-01-15T11:00:00'),
        completedAt: new Date('2024-01-16T03:00:00'),
        payment: {
          create: {
            customerId: customer1.id,
            amount: 17350,
            method: 'WALLET',
            status: 'SUCCESS',
            paidAt: new Date('2024-01-16T03:05:00'),
          },
        },
        review: {
          create: {
            reviewerId: customer1.userId,
            driverId: driver1.id,
            rating: 5,
            comment: 'Excellent service! Delivered on time and handled cargo with care.',
          },
        },
      },
    })

    // Create driver earning for this booking
    await prisma.driverEarning.create({
      data: {
        driverId: driver1.id,
        bookingId: booking.id,
        amount: 17350,
        commission: 2602.5, // 15% commission
        netAmount: 14747.5,
        status: 'PAID',
        paidAt: new Date('2024-01-16T03:10:00'),
      },
    })

    console.log('✅ Created sample bookings and transactions')
  }

  // Create sample notifications
  const allUsers = await prisma.user.findMany()
  await Promise.all(
    allUsers.map((user) =>
      prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to Trinck!',
          message: 'Thank you for joining our platform. Start booking reliable trucking services today!',
          type: 'SYSTEM',
          isRead: false,
        },
      })
    )
  )

  console.log('✅ Created sample notifications')

  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
