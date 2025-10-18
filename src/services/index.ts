// 导出基础服务类
import { type Context } from "@/lib/context";

import { DocumentService } from "./document";

export class Services {
  constructor(private readonly ctx: Context) {}
  get document() {
    return new DocumentService(this.ctx);
  }
}
