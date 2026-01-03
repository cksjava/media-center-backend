// src/models/Setting.ts
import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/db.js";

export class Setting extends Model<InferAttributes<Setting>, InferCreationAttributes<Setting>> {
  declare name: string;
  declare value: string | null;

  // Sequelize manages these when timestamps=true
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Setting.init(
  {
    name: {
      type: DataTypes.STRING(191),
      primaryKey: true,
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ✅ Include timestamp columns so TS is happy (Sequelize will auto-fill them)
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Setting",
    tableName: "settings",
    timestamps: true,
  }
);
