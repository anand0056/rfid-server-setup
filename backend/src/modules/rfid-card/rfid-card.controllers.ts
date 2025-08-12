import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { RfidCardService } from './rfid-cards.service';

@Controller('rfid/cards')
export class RfidCardController {
  constructor(private readonly rfidCardService: RfidCardService) {}

  @Get()
  async getCards(
    @Query('tenantId') tenantId?: string,
    @Query('active') active?: string,
  ) {
    const tenantIdNum = tenantId ? +tenantId : undefined;
    const isActive = active !== undefined ? active === 'true' : undefined;
    return this.rfidCardService.getCards(tenantIdNum, isActive);
  }

  // New endpoint for comprehensive tenant overview
  @Get('tenant/:tenantId/overview')
  async getTenantOverview(@Param('tenantId') tenantId: string) {
    return this.rfidCardService.getTenantOverview(+tenantId);
  }

  // Get cards by type (staff or vehicle)
  @Get('tenant/:tenantId/type/:type')
  async getCardsByType(
    @Param('tenantId') tenantId: string,
    @Param('type') type: 'staff' | 'vehicle',
  ) {
    return this.rfidCardService.getCardsByType(+tenantId, type);
  }

  // Get unassigned cards
  @Get('tenant/:tenantId/unassigned')
  async getUnassignedCards(@Param('tenantId') tenantId: string) {
    return this.rfidCardService.getUnassignedCards(+tenantId);
  }

  // Get tenant statistics
  @Get('tenant/:tenantId/stats')
  async getTenantStats(@Param('tenantId') tenantId: string) {
    return this.rfidCardService.getTenantStats(+tenantId);
  }

  // Get reader with associated cards
  @Get('reader/:readerId')
  async getReaderWithCards(
    @Param('readerId') readerId: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.rfidCardService.getReaderWithCards(
      +readerId,
      tenantId ? +tenantId : undefined,
    );
  }

  @Get(':uid')
  async getCard(
    @Param('uid') uid: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.rfidCardService.getCardByUid(
      uid,
      tenantId ? +tenantId : undefined,
    );
  }

  @Post()
  async createCard(@Body() cardData: any) {
    const mappedData = {
      ...cardData,
      card_uid: cardData.uid,
      staff_id: cardData.assigned_staff_id,
      vehicle_id: cardData.assigned_vehicle_id,
    };
    delete mappedData.uid;
    delete mappedData.assigned_staff_id;
    delete mappedData.assigned_vehicle_id;

    return this.rfidCardService.createCard(mappedData);
  }

  @Put(':uid')
  async updateCard(
    @Param('uid') uid: string,
    @Body() cardData: any,
    @Query('tenantId') tenantId?: string,
  ) {
    const mappedData = {
      ...cardData,
      card_uid: cardData.uid,
      staff_id: cardData.assigned_staff_id,
      vehicle_id: cardData.assigned_vehicle_id,
    };
    delete mappedData.uid;
    delete mappedData.assigned_staff_id;
    delete mappedData.assigned_vehicle_id;

    return this.rfidCardService.updateCard(
      uid,
      mappedData,
      tenantId ? +tenantId : undefined,
    );
  }

  @Delete(':uid')
  async deleteCard(
    @Param('uid') uid: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.rfidCardService.deleteCard(
      uid,
      tenantId ? +tenantId : undefined,
    );
  }
}
