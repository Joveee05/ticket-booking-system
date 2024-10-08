import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  @IsNotEmpty()
  public user_id: number;

  @IsNumber()
  @IsNotEmpty()
  public event_id: number;

  @IsString()
  @IsOptional()
  public status: string;
}
