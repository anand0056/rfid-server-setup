import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) {}

   private users: any[] = [];

   async onModuleInit() {
        const hashedPassword = await bcrypt.hash('anand0056', 10);
        this.users.push({
            id: 1,
            username: 'anand',
            password: hashedPassword,
        });
    }

    async validateUser(username: string, password: string): Promise<any> {
        const user = this.users.find(user => user.username === username);
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        throw new UnauthorizedException("Invalid credentials");
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}