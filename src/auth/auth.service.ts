import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import { User, UserDocument } from "../user/schemas/user.schema";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
 constructor(
  @InjectModel(User.name) private userModel: Model<User>,
  private jwtService: JwtService
 ) {}

 async register(dto: RegisterDto) {
  const exists = await this.userModel.findOne({ email: dto.email });
  if (exists) throw new UnauthorizedException("Email já cadastrado");
  const hash = await bcrypt.hash(dto.password, 10);
  const user = await this.userModel.create({
   email: dto.email,
   password: hash,
   nome: dto.nome,
  });
  return this.gerarToken(user);
 }

 async login(dto: LoginDto) {
  const user = await this.userModel.findOne({ email: dto.email });
  if (!user || !(await bcrypt.compare(dto.password, user.password))) {
   throw new UnauthorizedException("Credenciais inválidas");
  }
  return this.gerarToken(user);
 }

 private gerarToken(user: UserDocument) {
  const payload = { sub: user._id.toString(), email: user.email };
  const plano = user.plano
   ? {
      titulo: user.plano.titulo,
      slug: user.plano.slug,
      valor: user.plano.valor,
      ciclo: user.plano.ciclo,
      dataAdmissao: user.plano.dataAdmissao,
      dataVencimento: user.plano.dataVencimento,
     }
   : null;
  return {
   access_token: this.jwtService.sign(payload),
   user: {
    id: user._id,
    email: user.email,
    nome: user.nome,
    plano,
   },
  };
 }
}
