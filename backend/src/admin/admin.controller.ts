import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { UserRole } from 'src/users/entities/user.entity';
import { AdminService } from './admin.services';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('contacts')
  getAllContacts() {
    return this.adminService.getAllContacts();
  }

  @Delete('user/:id')
  deleteUser(@Param(':id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Delete('contact/:id')
  deleteContact(@Param(':id') id: string) {
    return this.adminService.deleteContact(id);
  }
}
