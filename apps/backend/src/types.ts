export interface DbClient {
  user: {
    create: (arg: any) => Promise<any>;
    findMany: () => Promise<any[]>;
    upsert: (arg: { where: any, update: any, create: any }) => Promise<any>;
    update: (arg: { where: any, data: any }) => Promise<any>;
    findUnique: (arg: any) => Promise<any>;
    findFirst: (arg: { where: any }) => Promise<any>;
  };
  post: {
    findMany: (arg: { include: any, orderBy?: any }) => Promise<any[]>;
    findUnique: (arg: { where: any, include?: any }) => Promise<any>;
    create: (arg: { data: any }) => Promise<any>;
    update: (arg: { where: any, data: any }) => Promise<any>;
    delete: (arg: { where: any }) => Promise<any>;
  };
  postLike: {
    findMany: () => Promise<any[]>;
    create: (arg: { data: any }) => Promise<any>;
    upsert: (arg: { where: any, update: any, create: any }) => Promise<any>;
    delete: (arg: { where: any }) => Promise<any>;
  };
  comment: {
    findMany: () => Promise<any[]>;
    findUnique: (arg: { where: any, include?: any }) => Promise<any>;
    create: (arg: { data: any }) => Promise<any>;
    update: (arg: { where: any, data: any }) => Promise<any>;
    delete: (arg: { where: any }) => Promise<any>;
  };
  notification: {
    findMany: (arg?: any) => Promise<any[]>;
    create: (arg: { data: any }) => Promise<any>;
    count: (arg: any) => Promise<any>;
    updateMany: (arg: any) => Promise<any>;
    update: (arg: { where: any, data: any }) => Promise<any>;
  };
}