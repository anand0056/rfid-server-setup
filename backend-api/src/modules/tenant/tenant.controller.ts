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
import { TenantService } from './tenant.service';
import { Tenant } from './tenant.entity';

@Controller('api/tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  async getAllTenants() {
    try {
      const tenants = await this.tenantService.findAll();
      return {
        success: true,
        data: tenants,
        total: tenants.length,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch tenants',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats')
  async getAllTenantsStats() {
    try {
      const tenants = await this.tenantService.findAll();
      return {
        total: tenants.length,
        active: tenants.filter((t) => t.is_active).length,
        inactive: tenants.filter((t) => !t.is_active).length,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch tenant stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getTenant(@Param('id', ParseIntPipe) id: number) {
    try {
      const tenant = await this.tenantService.findOne(id);
      if (!tenant) {
        throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND);
      }
      return {
        success: true,
        data: tenant,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch tenant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/stats')
  async getTenantStats(@Param('id', ParseIntPipe) id: number) {
    try {
      const stats = await this.tenantService.getTenantStats(id);
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch tenant stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('code/:tenantCode')
  async getTenantByCode(@Param('tenantCode') tenantCode: string) {
    try {
      const tenant = await this.tenantService.findByCode(tenantCode);
      if (!tenant) {
        throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND);
      }
      return {
        success: true,
        data: tenant,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch tenant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async createTenant(@Body() tenantData: Partial<Tenant>) {
    try {
      // Validate required fields
      if (!tenantData.name || !tenantData.tenant_code) {
        throw new HttpException(
          'Name and tenant code are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const tenant = await this.tenantService.create({
        ...tenantData,
        is_active: tenantData.is_active ?? true,
      });

      return {
        success: true,
        data: tenant,
        message: 'Tenant created successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create tenant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async updateTenant(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<Tenant>,
  ) {
    try {
      const tenant = await this.tenantService.update(id, updateData);
      if (!tenant) {
        throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: tenant,
        message: 'Tenant updated successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update tenant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteTenant(@Param('id', ParseIntPipe) id: number) {
    try {
      // Soft delete by setting is_active to false
      const tenant = await this.tenantService.update(id, { is_active: false });
      if (!tenant) {
        throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        message: 'Tenant deactivated successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete tenant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
