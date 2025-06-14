import { Injectable } from '@nestjs/common';
import { LeadService } from 'src/modules/lead/services/lead.service';
@Injectable()
export class DahsboardService {
  constructor(
    private readonly leadService:LeadService,
  ) {}

 
}
