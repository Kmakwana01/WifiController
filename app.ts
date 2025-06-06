import createError from 'http-errors'
import express,{Request,Response,NextFunction,Errback} from 'express'
import path from 'path';
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import dotenv from 'dotenv'
import { mongodbConnection } from './database/db';
mongodbConnection()
dotenv.config()


//router

let app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

import authRouter from './routes/authRoute'
import deviceRouter from './routes/deviceRoute'
import subscriptionRouter from './routes/subscriptionRoute'

app.use('/', authRouter);
app.use('/device', deviceRouter);
app.use('/subscription', subscriptionRouter);

// catch 404 and forward to error handler
app.use(function(req , res, next) {
  next(createError(404));
});

// error handler
app.use(async (err: Error, req: Request, res: Response, next: NextFunction) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page

  res.status((err as any).status || 500);
  res.render('error');
});

export default app;
