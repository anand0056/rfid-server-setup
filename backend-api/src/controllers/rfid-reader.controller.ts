import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { RfidReaderService } from '../services/rfid-reader.service';

@Controller('api/rfid/readers')
export class RfidReaderController {
  constructor(private readonly rfidReaderService: RfidReaderService) {}

  @Get()
  async getReaders(
    @Query('tenantId') tenantId?: string,
    @Query('online') online?: string,
  ) {
    try {
      const parsedTenantId = tenantId ? +tenantId : undefined; // Make tenantId truly optional
      const readers = await this.rfidReaderService.getReaders(parsedTenantId, online === 'true');
      return readers;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch readers: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getReader(@Param('id') id: string, @Query('tenantId') tenantId?: string) {
    try {
      const readerId = +id;
      const reader = await this.rfidReaderService.getReaderById(readerId);
      if (!reader) {
        throw new HttpException('Reader not found', HttpStatus.NOT_FOUND);
      }
      return reader;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to fetch reader: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async createReader(@Body() readerData: any) {
    try {
      // Ensure reader_group_id is properly handled
      if (readerData.reader_group_id === '' || 
          readerData.reader_group_id === undefined || 
          readerData.reader_group_id === null || 
          readerData.reader_group_id === 0) {
        // Explicitly set to null for SQL foreign key constraints
        readerData.reader_group_id = null;
      } else {
        // Ensure it's a number if provided
        readerData.reader_group_id = +readerData.reader_group_id;
        
        // If conversion resulted in NaN, set to null
        if (isNaN(readerData.reader_group_id)) {
          readerData.reader_group_id = null;
        }
      }

      // Validate required fields
      if (!readerData.reader_id) {
        throw new HttpException('Reader ID is required', HttpStatus.BAD_REQUEST);
      }
      
      if (!readerData.name) {
        throw new HttpException('Reader name is required', HttpStatus.BAD_REQUEST);
      }

      if (!readerData.tenant_id) {
        throw new HttpException('Tenant ID is required', HttpStatus.BAD_REQUEST);
      }

      console.log('Creating reader with data:', JSON.stringify(readerData, null, 2));
      
      try {
        const result = await this.rfidReaderService.createReader(readerData);
        console.log('Reader created successfully:', JSON.stringify(result, null, 2));
        return result;
      } catch (serviceError) {
        console.error('Service error creating reader:', serviceError);
        console.error('Error stack:', serviceError.stack);
        throw serviceError;
      }
    } catch (error) {
      console.error('Error creating reader:', error);
      console.error('Error stack:', error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to create reader: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async updateReader(@Param('id') id: string, @Body() updateData: any) {
    try {
      const readerId = +id;
      
      // Ensure reader_group_id is properly handled
      if (updateData.reader_group_id === '' || 
          updateData.reader_group_id === undefined || 
          updateData.reader_group_id === null || 
          updateData.reader_group_id === 0) {
        // Explicitly set to null for SQL foreign key constraints
        updateData.reader_group_id = null;
      } else {
        // Ensure it's a number if provided
        updateData.reader_group_id = +updateData.reader_group_id;
        
        // If conversion resulted in NaN, set to null
        if (isNaN(updateData.reader_group_id)) {
          updateData.reader_group_id = null;
        }
      }

      const reader = await this.rfidReaderService.updateReader(readerId, updateData);
      if (!reader) {
        throw new HttpException('Reader not found', HttpStatus.NOT_FOUND);
      }
      
      return reader;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to update reader: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteReader(@Param('id') id: string) {
    try {
      const readerId = +id;
      const result = await this.rfidReaderService.deleteReader(readerId);
      return result;
    } catch (error) {
      throw new HttpException(
        `Failed to delete reader: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
