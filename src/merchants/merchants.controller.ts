import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUserInfo } from 'src/auth/decorators/get-user-info.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateMerchantStatusDto } from './dto/update-merchant-status.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { MerchantsService } from './merchants.service';

@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Get('departments-cities')
  @Auth()
  getDepartmentsAndCities() {
    return this.merchantsService.getDepartmentsAndCities();
  }

  @Get()
  @Auth()
  getMerchants(@Query() paginationDto: PaginationDto) {
    return this.merchantsService.getMerchants(paginationDto);
  }

  @Get('export')
  @Auth(ValidRoles.Administrador)
  exportMerchants() {
    return this.merchantsService.generateCSV();
  }

  @Get(':id')
  @Auth()
  getMerchantById(@Param('id', ParseIntPipe) id: number) {
    return this.merchantsService.getMerchantById(id);
  }

  @Post()
  @Auth()
  createMerchant(
    @Body() createMerchantDto: CreateMerchantDto,
    @GetUserInfo() user: any,
  ) {
    return this.merchantsService.createMerchant(createMerchantDto, user.id);
  }

  @Patch(':id')
  @Auth()
  updateMerchant(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMerchantDto: UpdateMerchantDto,
    @GetUserInfo() user: any,
  ) {
    return this.merchantsService.updateMerchant(id, updateMerchantDto, user.id);
  }

  @Patch(':id/status')
  @Auth()
  updateMerchantStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMerchantStatusDto: UpdateMerchantStatusDto,
    @GetUserInfo() user: any,
  ) {
    return this.merchantsService.updateMerchantStatus(
      id,
      updateMerchantStatusDto.estado,
      user.id,
    );
  }

  @Delete(':id')
  @Auth(ValidRoles.Administrador)
  deleteMerchant(@Param('id', ParseIntPipe) id: number) {
    return this.merchantsService.deleteMerchant(id);
  }
}
