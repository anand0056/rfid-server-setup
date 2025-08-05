import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "src/controllers/auth.controller";
import { AuthService } from "src/services/auth.service";
import { JwtStrategy } from "src/services/jwt.strategy";

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: 'anand0056',
            signOptions: { expiresIn: '1h' },
        }),
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
})
export class AuthModule {}