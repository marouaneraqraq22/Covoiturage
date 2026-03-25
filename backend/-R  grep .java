[33mcommit 60f7f8bb816450725b34eba1333cca14e961f855[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m, [m[1;31morigin/main[m[33m)[m
Author: marouaneraqraq22 <marouane.raqraq20@ump.ac.ma>
Date:   Wed Mar 25 16:20:29 2026 +0100

    Cleanup: remove build and IDE files from repository

 .idea/.gitignore                                    |  10 [31m----------[m
 .idea/compiler.xml                                  |  19 [31m-------------------[m
 .idea/dataSources.xml                               |  19 [31m-------------------[m
 .idea/encodings.xml                                 |   6 [31m------[m
 .idea/jarRepositories.xml                           |  20 [31m--------------------[m
 .idea/misc.xml                                      |  12 [31m------------[m
 target/classes/application.properties               |  18 [31m------------------[m
 .../com/covoiturage/CovoiturageApplication.class    | Bin [31m752[m -> [32m0[m bytes
 .../com/covoiturage/config/AdminInitializer.class   | Bin [31m2622[m -> [32m0[m bytes
 .../covoiturage/controller/AdminController.class    | Bin [31m5276[m -> [32m0[m bytes
 .../com/covoiturage/controller/AuthController.class | Bin [31m2060[m -> [32m0[m bytes
 .../controller/ReservationController.class          | Bin [31m11118[m -> [32m0[m bytes
 .../covoiturage/controller/TrajetController.class   | Bin [31m7448[m -> [32m0[m bytes
 .../com/covoiturage/controller/UserController.class | Bin [31m5270[m -> [32m0[m bytes
 ...cationRequest$AuthenticationRequestBuilder.class | Bin [31m1668[m -> [32m0[m bytes
 .../com/covoiturage/dto/AuthenticationRequest.class | Bin [31m2667[m -> [32m0[m bytes
 ...tionResponse$AuthenticationResponseBuilder.class | Bin [31m1831[m -> [32m0[m bytes
 .../covoiturage/dto/AuthenticationResponse.class    | Bin [31m3090[m -> [32m0[m bytes
 .../RegisterRequest$RegisterRequestBuilder.class    | Bin [31m2246[m -> [32m0[m bytes
 .../com/covoiturage/dto/RegisterRequest.class       | Bin [31m4469[m -> [32m0[m bytes
 .../exception/GlobalExceptionHandler.class          | Bin [31m2268[m -> [32m0[m bytes
 .../model/Reservation$ReservationBuilder.class      | Bin [31m2028[m -> [32m0[m bytes
 .../classes/com/covoiturage/model/Reservation.class | Bin [31m4141[m -> [32m0[m bytes
 .../com/covoiturage/model/ReservationStatus.class   | Bin [31m1308[m -> [32m0[m bytes
 target/classes/com/covoiturage/model/Role.class     | Bin [31m1161[m -> [32m0[m bytes
 .../covoiturage/model/Trajet$TrajetBuilder.class    | Bin [31m3046[m -> [32m0[m bytes
 target/classes/com/covoiturage/model/Trajet.class   | Bin [31m6679[m -> [32m0[m bytes
 .../classes/com/covoiturage/model/TypeTrajet.class  | Bin [31m1162[m -> [32m0[m bytes
 .../com/covoiturage/model/User$UserBuilder.class    | Bin [31m2645[m -> [32m0[m bytes
 target/classes/com/covoiturage/model/User.class     | Bin [31m6745[m -> [32m0[m bytes
 .../repository/ReservationRepository.class          | Bin [31m783[m -> [32m0[m bytes
 .../covoiturage/repository/TrajetRepository.class   | Bin [31m929[m -> [32m0[m bytes
 .../com/covoiturage/repository/UserRepository.class | Bin [31m619[m -> [32m0[m bytes
 .../covoiturage/security/ApplicationConfig.class    | Bin [31m4076[m -> [32m0[m bytes
 .../security/JwtAuthenticationFilter.class          | Bin [31m3903[m -> [32m0[m bytes
 .../com/covoiturage/security/JwtService.class       | Bin [31m5759[m -> [32m0[m bytes
 .../security/SecurityConfiguration.class            | Bin [31m7554[m -> [32m0[m bytes
 .../covoiturage/service/AuthenticationService.class | Bin [31m4431[m -> [32m0[m bytes
 38 files changed, 104 deletions(-)
