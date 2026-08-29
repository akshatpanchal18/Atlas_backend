import { prisma } from "../../config/prisma";
import { Prisma } from "../../generated/prisma/client";

class UserRepository {
  static findById(id: string, select?: Prisma.UserSelect) {
    return prisma.user.findUnique({
      where: { id },
      select,
    });
  }

  static findByEmail(email: string, select?: Prisma.UserSelect) {
    return prisma.user.findUnique({
      where: { email },
      select,
    });
  }

  static findByUsername(username: string, select?: Prisma.UserSelect) {
    return prisma.user.findUnique({
      where: { username },
      select,
    });
  }
  static existsByUsername = async (
    username: string,
    select?: Prisma.UserSelect,
  ) => {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      select,
    });

    return !!user;
  };
  static create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
    });
  }

  static update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  static delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  static findMany(args: Prisma.UserFindManyArgs) {
    return prisma.user.findMany(args);
  }

  static count(args?: Prisma.UserCountArgs) {
    return prisma.user.count(args);
  }
}

export default UserRepository;
