encoder.py 소스코드를 기반으로 한 encoder 컴포넌트

0. 컴포넌트 설치방법 & 위치
 - package.json 파일이 포함된 .node-red 위치에서 (기본 C:\USER\USER\.node-red)
  >>  npm install {your diretory}/neuralCoding  <<
 - encoder.js 파일 34번째 라인의 적용 경로 수정필요
  >> naide 폴더 내 최상위 경로가 기준 (package.json 파일이 존재하는 곳) <<
                                          (package.json 내용 중 name : node-red 인 곳)

1. 사용 방법
 - encoder 컴포넌트 배치 후 더블클릭
 - 속성창에서 원하는 인코딩 방식과 파라미터 입력
 - 배포 후 encoder 컴포넌트 동작시 데이터 인코딩 시작
 - 수행 결과 메세지의 페이로드 값으로 전달
 - 전달되는 데이터 형식은 텐서형태의 string 

2. 컴포넌트 동작 내용
 - Simple, Poisson, Population 3개 인코딩 방식 동작 완료
 - SimplePoisson, PopulationEncoder 2개 동작 예제코드 전달시 추가 가능

3. 현재 알려진 이슈
 - encoder.py 파일의 Poisson 인코딩 코드가 python3.9.6 버전에서는 동작하지 않음 
   (3.6.9 버전에서는 정상동작함을 확인함)