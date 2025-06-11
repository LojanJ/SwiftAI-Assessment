/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PartialType } from '@nestjs/mapped-types';
import { CreateContactDTO } from 'src/auth/dto/create-contact.dto';

export class UpdateContactDTO extends PartialType(CreateContactDTO) {}
