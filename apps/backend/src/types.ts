export interface DbClient {
  user: {
    findMany: (args?: any) => Promise<any[]>
    findUnique: (args: any) => Promise<any | null>
    create: (args: any) => Promise<any>
    update: (args: any) => Promise<any>
    delete: (args: any) => Promise<any>
  }
  post: {
    findMany: (args?: any) => Promise<any[]>
    findUnique: (args: any) => Promise<any | null>
    create: (args: any) => Promise<any>
    update: (args: any) => Promise<any>
    delete: (args: any) => Promise<any>
  }
  comment: {
    findMany: (args?: any) => Promise<any[]>
    findUnique: (args: any) => Promise<any | null>
    create: (args: any) => Promise<any>
    delete: (args: any) => Promise<any>
  }
  postLike: {
    findUnique: (args: any) => Promise<any | null>
    create: (args: any) => Promise<any>
    delete: (args: any) => Promise<any>
  }
  notification: {
    findMany: (args?: any) => Promise<any[]>
    create: (args: any) => Promise<any>
    update: (args: any) => Promise<any>
    updateMany: (args: any) => Promise<any>
  }
}