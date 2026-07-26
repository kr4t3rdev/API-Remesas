import {
  IsIn,
  IsString,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Expo } from "expo-server-sdk";

function IsExpoPushToken(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: "isExpoPushToken",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === "string" && Expo.isExpoPushToken(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid Expo push token`;
        },
      },
    });
  };
}

export class RegisterPushTokenDto {
  @ApiProperty({ description: "Expo push token" })
  @IsString()
  @IsExpoPushToken()
  pushToken: string;

  @ApiProperty({ enum: ["android", "ios"] })
  @IsString()
  @IsIn(["android", "ios"])
  platform: string;
}
