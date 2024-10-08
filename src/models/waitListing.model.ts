import { Model, DataTypes, Sequelize } from 'sequelize';
import { EventModel } from './event.model';

interface WaitingListAttributes {
  id?: number;
  user_id: number;
  event_id: number;
}

export class WaitingListModel
  extends Model<WaitingListAttributes>
  implements WaitingListAttributes
{
  public id!: number;
  public user_id!: number;
  public event_id!: number;
}

export default function (sequelize: Sequelize): typeof WaitingListModel {
  WaitingListModel.init(
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
    },
    { sequelize, tableName: 'waitingLists' }
  );
  return WaitingListModel;
}

//WaitingListModel.belongsTo(EventModel, { foreignKey: 'event_id' });
