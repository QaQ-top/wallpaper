import { createApp } from 'vue';
import App from './App.vue';
import '@/themes/global.scss';

const WallpaperApp = createApp(App);







WallpaperApp.mount('#app');



window.wallpaperPropertyListener = {
  applyUserProperties: (prop) => {
    console.log("applyUserProperties", prop)

  },
  applyGeneralProperties: (prop) => {
    console.log("applyGeneralProperties", prop)
  },
  userDirectoryFilesAddedOrChanged: (key, files) => {
    console.log("userDirectoryFilesAddedOrChanged", key, files)

  },
  userDirectoryFilesRemoved: (key, files) => {
    console.log("userDirectoryFilesRemoved", key, files)

  }
}


if(GLOBAL_ENV === "prod") {
  window.wallpaperRegisterAudioListener((array) => {
    console.log("wallpaperRegisterAudioListener",array)
  })
  
  window.wallpaperRequestRandomFileForProperty("customrandomdirectory", (file) => {
    console.log("wallpaperRequestRandomFileForProperty", file)

  })
}



console.log(GLOBAL_ENV)