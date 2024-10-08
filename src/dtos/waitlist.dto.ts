import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateWaitListDto {
  @IsNumber()
  @IsNotEmpty()
  public user_id: number;

  @IsNumber()
  @IsNotEmpty()
  public event_id: number;
}
