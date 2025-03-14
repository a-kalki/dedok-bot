import fs from "fs-extra";

export class JsonRepository<T> {
  private cache: { [key: string]: any } = {};
  private isCacheLoaded = false;
  private cacheLoadPromise: Promise<void> | null = null;

  constructor(private filePath: string) {
    this.initialize();
  }

  // Инициализация кеша (загрузка данных из файла)
  private async initialize(): Promise<void> {
    if (!this.cacheLoadPromise) {
      this.cacheLoadPromise = (async () => {
        if (await fs.pathExists(this.filePath)) {
          this.cache = await fs.readJson(this.filePath);
        } else {
          this.cache = {};
        }
        this.isCacheLoaded = true;
      })();
    }
    await this.cacheLoadPromise;
  }

  // Сохранение данных в файл
  private async saveCache(): Promise<void> {
    if (!this.isCacheLoaded) {
      await this.cacheLoadPromise;
    }
    await fs.writeJson(this.filePath, this.cache, { spaces: 2 });
  }

  // Добавление или обновление данных в кеше
  public async update(key: string, data: T): Promise<void> {
    if (!this.isCacheLoaded) {
      await this.cacheLoadPromise;
    }
    this.cache[key] = data;
    await this.saveCache();
  }

  // Чтение данных из кеша
  public async get(key: string): Promise<T | undefined> {
    if (!this.isCacheLoaded) {
      await this.cacheLoadPromise;
    }
    return this.cache[key];
  }

  // Получение всех данных из кеша
  public async getAll(): Promise<{ [key: string]: T }> {
    if (!this.isCacheLoaded) {
      await this.cacheLoadPromise;
    }
    return this.cache;
  }

  // Удаление данных из кеша
  public async delete(key: string): Promise<void> {
    if (!this.isCacheLoaded) {
      await this.cacheLoadPromise;
    }
    delete this.cache[key];
    await this.saveCache();
  }
}
