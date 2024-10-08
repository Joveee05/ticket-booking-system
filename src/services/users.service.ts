import { hash } from 'bcrypt';
import { Service } from 'typedi';
import { DB } from '@database';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@/exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { HTTP_STATUS_CODE, UserResponse } from '@/types/custom.types';
import RootService from './root.service';

@Service()
export class UserService extends RootService {
  public async getUserById(user_id: number): Promise<UserResponse<User>> {
    const findUser: User = await DB.Users.findOne({
      where: { id: user_id },
      attributes: {
        exclude: ['password'],
      },
    });
    if (!findUser)
      throw new HttpException(HTTP_STATUS_CODE.NOT_FOUND, "User doesn't exist");

    return this.processResponse({
      statusCode: HTTP_STATUS_CODE.OK,
      message: 'User found successfully',
      data: findUser,
    });
  }

  public async updateUserById(
    user_id: number,
    userData: CreateUserDto
  ): Promise<UserResponse<User>> {
    const findUser: User = await DB.Users.findByPk(user_id);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const hashedPassword = await hash(userData.password, 10);
    await DB.Users.update(
      { ...userData, password: hashedPassword },
      { where: { id: user_id } }
    );

    const updateUser: User = await DB.Users.findByPk(user_id);

    return this.processResponse({
      statusCode: HTTP_STATUS_CODE.OK,
      message: 'User updated successfully',
      data: updateUser,
    });
  }

  public async deleteUserById(user_id: number): Promise<UserResponse<User>> {
    const findUser: User = await DB.Users.findByPk(user_id);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    await DB.Users.destroy({ where: { id: user_id } });

    return this.processResponse({
      statusCode: HTTP_STATUS_CODE.OK,
      message: 'User deleted successfully',
    });
  }
}
