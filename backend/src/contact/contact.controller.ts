/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  Response,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response as Res } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateContactDTO } from 'src/auth/dto/create-contact.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import * as multer from 'multer';
import { ContactService } from './contact.service';

@Controller('contact')
@UseGuards(JwtAuthGuard)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createCon: CreateContactDTO,
    @UploadedFile() file: multer,
    @Request() req,
  ) {
    if (file) {
      createCon.profilePhoto = file.filename;
    }
    return this.contactService.create(createCon, req.user);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy?: string,
    @Query('sortOrder', new DefaultValuePipe('DESC'))
    sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.contactService.findAll(
      req.user,
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    );
  }

  @Get('export/CSV')
  async exportCSV(@Request() req, @Response() res: Res) {
    const csv = await this.contactService.exportCsv(req.user);
    res.header('Content-Type', 'text/csv');
    res.attachment('contacts.csv');
    return res.send(csv);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.contactService.findOne(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContactDTO: CreateContactDTO,
    @UploadedFile() file: multer,
    @Request() req,
  ) {
    if (file) {
      updateContactDTO.profilePhoto = file.filename;
    }
    return this.contactService.update(id, updateContactDTO, req.user);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    return this.contactService.remove(id, req.user);
  }
}
