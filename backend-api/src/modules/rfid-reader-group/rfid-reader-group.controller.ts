import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RfidReaderGroupService } from './rfid-reader-group.service';

@Controller('api/reader-groups')
export class RfidReaderGroupController {
  constructor(private readonly readerGroupService: RfidReaderGroupService) {}

  @Get()
  async getAllGroups(@Query('tenantId') tenantId?: string) {
    try {
      const parsedTenantId = tenantId ? +tenantId : undefined;
      const groups = await this.readerGroupService.findAll(parsedTenantId);
      return groups;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch reader groups: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getGroup(@Param('id') id: string) {
    try {
      const groupId = +id;
      const group = await this.readerGroupService.findOne(groupId);

      if (!group) {
        throw new HttpException('Reader group not found', HttpStatus.NOT_FOUND);
      }

      return group;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to fetch reader group: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async createGroup(@Body() groupData: any) {
    try {
      // Validate required fields
      if (!groupData.group_name) {
        throw new HttpException(
          'Group name is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!groupData.tenant_id) {
        throw new HttpException(
          'Tenant ID is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      return this.readerGroupService.create(groupData);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to create reader group: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async updateGroup(@Param('id') id: string, @Body() updateData: any) {
    try {
      const groupId = +id;
      const group = await this.readerGroupService.update(groupId, updateData);

      if (!group) {
        throw new HttpException('Reader group not found', HttpStatus.NOT_FOUND);
      }

      return group;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to update reader group: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteGroup(@Param('id') id: string) {
    try {
      const groupId = +id;
      return this.readerGroupService.delete(groupId);
    } catch (error) {
      throw new HttpException(
        `Failed to delete reader group: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
