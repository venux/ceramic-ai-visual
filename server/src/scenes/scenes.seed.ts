import { Model } from 'mongoose';
import { Scene, SceneDocument } from './scene.schema';

const defaultScenes = [
  {
    name: '纯白背景',
    category: '白底',
    thumbnail: '/assets/scenes/white-bg.jpg',
    prompt: 'pure white background, product photography, studio lighting',
    isActive: true,
  },
  {
    name: '原木桌面',
    category: '木桌',
    thumbnail: '/assets/scenes/wood-table.jpg',
    prompt: 'wooden table surface, warm lighting, rustic style',
    isActive: true,
  },
  {
    name: '中式茶席',
    category: '茶席',
    thumbnail: '/assets/scenes/tea-setting.jpg',
    prompt: 'traditional Chinese tea ceremony setup, bamboo mat, zen atmosphere',
    isActive: true,
  },
  {
    name: '展厅陈列',
    category: '展厅',
    thumbnail: '/assets/scenes/showroom.jpg',
    prompt: 'modern showroom display, elegant pedestals, gallery lighting',
    isActive: true,
  },
  {
    name: '居家场景',
    category: '生活',
    thumbnail: '/assets/scenes/home-life.jpg',
    prompt: 'cozy home environment, living room shelf, natural daylight',
    isActive: true,
  },
  {
    name: '节日氛围',
    category: '节日',
    thumbnail: '/assets/scenes/festival.jpg',
    prompt: 'Chinese festival decoration, red lanterns, festive atmosphere',
    isActive: true,
  },
];

export async function seedScenes(sceneModel: Model<SceneDocument>) {
  const count = await sceneModel.countDocuments();
  if (count === 0) {
    await sceneModel.insertMany(defaultScenes);
    console.log('默认场景数据已初始化');
  }
}