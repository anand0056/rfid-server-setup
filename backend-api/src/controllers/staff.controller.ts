import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { StaffService } from '../services/staff.service';
import { Staff } from '../entities/staff.entity';

@Controller('api/staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) { }

  @Get()
  async getAllStaff(@Query('tenantId') tenantId?: string) {
    try {
      const parsedTenantId = tenantId ? +tenantId : undefined;
      const staff = await this.staffService.findAll(parsedTenantId);
      return staff;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch staff',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  @Get('stats')
  async getStaffStats(@Query('tenantId') tenantId?: string) {
    try {
      const parsedTenantId = tenantId ? +tenantId : undefined;
      const staff = await this.staffService.findAll(parsedTenantId);
      return {
        total: staff.length,
        active: staff.filter(s => s.is_active).length,
        inactive: staff.filter(s => !s.is_active).length,
        with_cards: staff.filter(s => s.rfid_cards && s.rfid_cards.length > 0).length,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch staff stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getStaff(@Param('id', ParseIntPipe) id: number) {
    try {
      const staff = await this.staffService.findOne(id);
      if (!staff) {
        throw new HttpException('Staff not found', HttpStatus.NOT_FOUND);
      }
      return staff;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch staff',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('employee/:employeeId')
  async getStaffByEmployeeId(
    @Param('employeeId') employeeId: string,
    @Query('tenantId') tenantId?: string,
  ) {
    try {
      const parsedTenantId = tenantId ? +tenantId : undefined;
      const staff = await this.staffService.findByEmployeeId(employeeId, parsedTenantId);
      if (!staff) {
        throw new HttpException('Staff not found', HttpStatus.NOT_FOUND);
      }
      return staff;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch staff',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async createStaff(@Body() staffData: Partial<Staff>) {
    try {
      // Validate required fields
      if (!staffData.first_name || !staffData.employee_id || !staffData.tenant_id) {
        throw new HttpException(
          'First name, employee ID, and tenant ID are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const staff = await this.staffService.create({
        ...staffData,
        is_active: staffData.is_active ?? true,
      });

      return {
        success: true,
        data: staff,
        message: 'Staff created successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create staff',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async updateStaff(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<Staff>,
  ) {
    try {
      const staff = await this.staffService.update(id, updateData);
      if (!staff) {
        throw new HttpException('Staff not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: staff,
        message: 'Staff updated successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update staff',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteStaff(@Param('id', ParseIntPipe) id: number) {
    try {
      // Soft delete by setting is_active to false
      const staff = await this.staffService.update(id, { is_active: false });
      if (!staff) {
        throw new HttpException('Staff not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        message: 'Staff deactivated successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete staff',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/assign-card')
  async assignCard(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { cardUid: string },
  ) {
    try {
      const result = await this.staffService.assignCard(id, body.cardUid);
      return {
        success: true,
        data: result,
        message: 'Card assigned successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to assign card',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('unassign-card')
  async unassignCard(@Body() body: { cardUid: string }) {
    try {
      const result = await this.staffService.unassignCard(body.cardUid);
      return {
        success: true,
        data: result,
        message: 'Card unassigned successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to unassign card',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
