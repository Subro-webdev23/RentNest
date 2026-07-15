
import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";
import { AuthRoutes } from "./modules/auth/auth.route";
const app : Application = express();

app.use(cors({
    origin : config.app_url,
    credentials : true,
}))
app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(cookieParser());


app.get('/', (req: Request, res: Response) => {
  res.send('RentNest API is running.');
});

app.use('/api', AuthRoutes);

app.use(globalErrorHandler);
app.use(notFound);


export default app;