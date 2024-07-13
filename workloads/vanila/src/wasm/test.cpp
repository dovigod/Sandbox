#include <iostream>
#include <string>
#include <memory>
#include <any>
#include <emscripten.h>
#include <emscripten/bind.h>
#include <unordered_map>



using namespace std;



int loopTest(int cnt){
  int a = 0;
  for(int i = 0 ; i < cnt ; i++){
    a ++;
  }
  return 0;
}

unordered_map<int, int> mapInstance;


void MapReadTestInit(unsigned int width){
  for(int i = 0; i < width ; i ++){
    mapInstance[i] = i;
  }
}

int MapReadTest(const unsigned int search){
  return mapInstance[search];
}


EMSCRIPTEN_BINDINGS(){
  emscripten::function("loopTest", &loopTest);
  emscripten::function("MapReadTestInit", &MapReadTestInit);
  emscripten::function("MapReadTest", &MapReadTest);
}
