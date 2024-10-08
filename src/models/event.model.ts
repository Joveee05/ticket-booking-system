import { Model, DataTypes, Sequelize } from 'sequelize';

interface EventAttributes {
  id?: number;
  event_name: string;
  total_tickets: number;
  available_tickets: number;
  status: string;
}

export class EventModel
  extends Model<EventAttributes>
  implements EventAttributes
{
  public id!: number;
  public event_name!: string;
  public total_tickets!: number;
  public available_tickets!: number;
  public status!: string;
}

export default function (sequelize: Sequelize): typeof EventModel {
  EventModel.init(
    {
      event_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      total_tickets: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      available_tickets: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'active',
      },
    },
    { sequelize, tableName: 'events' }
  );
  return EventModel;
}
