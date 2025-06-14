export const CORS = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders:
    'Content-Type, Accept, Access-Control-Allow-Headers, Authorization, X-Requested-With, Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Credentials',
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
