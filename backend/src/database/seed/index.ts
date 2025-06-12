/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { User, UserRole } from 'src/users/entities/user.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'contact_management',
  entities: [User],
  synchronize: false,
});

async function seed() {
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);

  // Create admin user
  const adminExists = await userRepository.findOne({
    where: { email: 'admin@example.com' },
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = userRepository.create({
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    });
    await userRepository.save(admin);
    console.log('Admin is created');
  }

  // Create regular user
  const userExists = await userRepository.findOne({
    where: { email: 'user@example.com' },
  });

  if (!userExists) {
    const hashedPassword = await bcrypt.hash('user123', 10);
    const user = userRepository.create({
      email: 'user@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.USER,
    });
    await userRepository.save(user);
    console.log('Test user created');
  }

  await AppDataSource.destroy();
}

seed().catch(console.error);
