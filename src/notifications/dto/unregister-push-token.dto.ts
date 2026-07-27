import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { RegisterPushTokenDto } from "./register-push-token.dto";

export class UnregisterPushTokenDto
  implements Pick<RegisterPushTokenDto, "pushToken">
{
  @ApiProperty({ description: "Expo push token to remove", minLength: 1 })
  @IsString()
  declare pushToken: string;
}
