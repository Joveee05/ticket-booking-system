import 'reflect-metadata';
import { App } from '@/app';
import { EventRoute } from '@routes/event.route';
import { ValidateEnv } from '@utils/validateEnv';
import { WaitingListRoute } from './routes/waitlist.route';
import { TicketRoute } from './routes/ticket.route';
import { UserRoute } from './routes/users.route';
import { AuthRoute } from './routes/auth.route';

ValidateEnv();

const app = new App([
  new UserRoute(),
  new AuthRoute(),
  new EventRoute(),
  new WaitingListRoute(),
  new TicketRoute(),
]);

app.listen();
