import { AuthProvider } from "./../../generated/prisma/enums";
import { prisma } from "../../config/prisma";
import { Prisma } from "../../generated/prisma/client";

class AccountRepository {
  static findById(id: string, select?: Prisma.AccountSelect) {
    return prisma.account.findUnique({
      where: { id },
      select,
    });
  }

  static findByProvider(
    provider: AuthProvider,
    providerId: string,
    select?: Prisma.AccountSelect,
  ) {
    return prisma.account.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
      select,
    });
  }

  static findByUserId(userId: string, select?: Prisma.AccountSelect) {
    return prisma.account.findMany({
      where: { userId },
      select,
    });
  }

  static create(data: Prisma.AccountCreateInput) {
    return prisma.account.create({
      data,
    });
  }

  static update(id: string, data: Prisma.AccountUpdateInput) {
    return prisma.account.update({
      where: { id },
      data,
    });
  }

  static delete(id: string) {
    return prisma.account.delete({
      where: { id },
    });
  }

  static deleteByProvider(provider: AuthProvider, providerId: string) {
    return prisma.account.delete({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
    });
  }

  static findMany(args: Prisma.AccountFindManyArgs) {
    return prisma.account.findMany(args);
  }

  static count(args?: Prisma.AccountCountArgs) {
    return prisma.account.count(args);
  }
}

export default AccountRepository;
