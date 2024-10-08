import { Model, DataTypes, Sequelize } from 'sequelize';
import { EventModel } from './event.model';

interface BookingAttributes {
  id?: number;
  user_id: number;
  event_id: number;
  status: string;
}

export class BookingModel
  extends Model<BookingAttributes>
  implements BookingAttributes
{
  public id!: number;
  public user_id!: number;
  public event_id!: number;
  public status!: string;
}

export default function (sequelize: Sequelize): typeof BookingModel {
  BookingModel.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      event_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: EventModel,
          key: 'id',
        },
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'booked',
      },
    },
    { sequelize, tableName: 'bookings' }
  );
  return BookingModel;
}

//BookingModel.belongsTo(EventModel, { foreignKey: 'event_id' });
