import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateEventDto {
  @IsString()
  public event_name: string;

  @IsNumber()
  public total_tickets: number;

  @IsNumber()
  @IsOptional()
  public available_tickets: number;

  @IsString()
  @IsOptional()
  public status: string;
}

export class UpdateEventDto {
  @IsNumber()
  public total_tickets: number;

  @IsNumber()
  public available_tickets: number;

  @IsString()
  public status: string;
}
