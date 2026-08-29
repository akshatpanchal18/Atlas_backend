import { prisma } from "../../config/prisma";
import { Prisma } from "../../generated/prisma/client";

class SessionRepository {
  static findById(id: string, select?: Prisma.SessionSelect) {
    return prisma.session.findUnique({
      where: { id },
      select,
    });
  }

  static findByTokenHash(secretHash: string, select?: Prisma.SessionSelect) {
    return prisma.session.findUnique({
      where: { secretHash },
      select,
    });
  }

  static findByUserId(userId: string, select?: Prisma.SessionSelect) {
    return prisma.session.findMany({
      where: { userId },
      select,
    });
  }

  static create(data: Prisma.SessionCreateInput) {
    return prisma.session.create({
      data,
    });
  }

  static update(id: string, data: Prisma.SessionUpdateInput) {
    return prisma.session.update({
      where: { id },
      data,
    });
  }

  static revoke(id: string) {
    return prisma.session.update({
      where: { id },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  static delete(id: string) {
    return prisma.session.delete({
      where: { id },
    });
  }

  static deleteByUserId(userId: string) {
    return prisma.session.deleteMany({
      where: { userId },
    });
  }

  static findMany(args: Prisma.SessionFindManyArgs) {
    return prisma.session.findMany(args);
  }

  static count(args?: Prisma.SessionCountArgs) {
    return prisma.session.count(args);
  }
}

export default SessionRepository;
