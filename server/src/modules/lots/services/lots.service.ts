import { Injectable } from '@nestjs/common';
import { CreateLotDto } from '../dto/create-lot.dto';
import { UpdateLotDto } from '../dto/update-lot.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Lots } from '../schemas/lots.schemas';
import { Model } from 'mongoose';
import { ErrorManager } from 'src/utils/error.manager';
import { NotificationService } from '../../notification/services/notification.service';

@Injectable()
export class LotsService {
  constructor(
    @InjectModel(Lots.name) private lotModel: Model<Lots>,
    private readonly notificationService: NotificationService,
  ) {}

  async create(createLotDto: CreateLotDto): Promise<Lots> {
    try {
      const lotFound = await this.lotModel.findOne({
        lot: createLotDto.lot,
        projectID: createLotDto.projectID,
      });
      if (lotFound) {
        throw new ErrorManager({
          message:
            'Ya existe un lote con ese nombre en el proyecto seleccionado',
          type: 'BAD_REQUEST',
        });
      }

      const createdLot = new this.lotModel(createLotDto);
      return await createdLot.save();
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findAll(): Promise<Lots[]> {
    try {
      return await this.lotModel.find({}).populate('projectID');
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findOne(id: string): Promise<Lots> {
    try {
      return await this.lotModel.findById(id);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findAllByProject(projectId: string): Promise<Lots[]> {
    try {
      return await this.lotModel.find({ projectID: projectId });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findAllByProjectAndStatus(
    projectId: string,
    status: string,
  ): Promise<Lots[]> {
    try {
      return await this.lotModel.find({ projectID: projectId, status: status });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async reserveLot(lotId: string, userId: string): Promise<void> {
    try {
      await this.lotModel.findByIdAndUpdate(lotId, {
        status: 'Reservado',
        reservedBy: userId,
        reservationDate: new Date(),
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async releaseLot(lotId: string): Promise<void> {
    try {
      await this.lotModel.findByIdAndUpdate(lotId, {
        status: 'Disponible',
        reservedBy: null,
        reservationDate: null,
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async releaseLotIfTenDaysPassed(): Promise<void> {
    try {
      const lots = await this.lotModel.find({ status: 'Reservado' });
      lots.forEach(async (lot) => {
        const today = new Date();
        const reservationDate = new Date(lot.reservationDate);
        const differenceInTime = today.getTime() - reservationDate.getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24);
        if (differenceInDays >= 10) {
          await this.notificationService.sendNotificationToAdmin({
            title: 'Lote liberado',
            message: `El lote ${lot.lot} ha sido liberado`,
            leadID: lot.reservedBy,
          });

          await this.notificationService.sendNotification({
            title: 'Lote liberado',
            message: `El lote ${lot.lot} ha sido liberado`,
            userID: lot.reservedBy,
          });

          await this.releaseLot(lot._id);
        }
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
