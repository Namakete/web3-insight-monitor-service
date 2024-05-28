import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('status')
  getStatus(): { status: string } {
    return { status: 'Server is running' };
  }
}
