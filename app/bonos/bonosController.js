'use strict';

const operations = require('./bonosOperations');
const loggerManagement = require('../common/logger');
const controller = {};
const cron = require("node-cron");
const fs = require('fs');
const Client = require("ssh2-sftp-client");
const moment = require('moment');

controller.postRewardtemplate = function(dataPostReward, conexion) {
    const timeRq = new Date();
    const data = {
        id_campannia: dataPostReward.id_campannia,
        customerRef: dataPostReward.customerRef,
        id_cuenta: dataPostReward.id_cuenta,
        rewardTemplateId: dataPostReward.rewardTemplateId,
        criteria: dataPostReward.criteria,
        fecha_asigna: dataPostReward.fecha_asigna
    }
    let url = global.configMicroservices.urlBonusKambiService + 'player/' + data.id_cuenta + '/reward?allow_unknown_players=true';
    const timeRq1 = new Date();
    operations.postRewardtemplate(url, data).then(result => {
        loggerManagement.insertLog(2, 'Asignar RewardTemplate', 'postKambi', timeRq1, 'Rq1', data, new Date(), 'Rs1', result, (new Date() - timeRq1));
        let dataSave = {
            id_campannia: data.id_campannia,
            id_cuenta: data.id_cuenta,
            estado: result.code == 200 || result.code == 201 ? 1 : 2,
            cod_respuesta: result.code,
            desc_respuesta: result.data,
            fecha_asigna: data.fecha_asigna
        }
        const timeRq2 = new Date();
        operations.postRstasignar_kambi(dataSave, conexion).then(res => {
            loggerManagement.insertLog(2, 'Guardar RewardTemplate', 'savePostKambi', timeRq2, 'Rq1', dataSave, new Date(), 'Rs1', res, (new Date() - timeRq2));
        })
    }).catch(err => {
        loggerManagement.insertLog(2, 'Asignar RewardTemplate', 'postKambi', timeRq, 'Rq1', data, new Date(), 'Rs1', JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))), (new Date() - timeRq));
    });
};


controller.postBonusProgram = function(dataPostProgram, conexion) {
    const timeRq = new Date();
    const data = {
        id_campannia: dataPostProgram.id_campannia,
        id_cuenta: dataPostProgram.id_cuenta,
        bonusProgramId: dataPostProgram.rewardTemplateId,
        criteria: dataPostProgram.criteria,
        customerRef: dataPostProgram.customerRef,
        fecha_asigna: dataPostProgram.fecha_asigna
    }
    let url = global.configMicroservices.urlBonusKambiService + 'player/' + data.id_cuenta + '/assignedbonusprogram?allow_unknown_players=true';
    const timeRq1 = new Date();
    operations.postbonusprogram(url, data).then(result => {
        loggerManagement.insertLog(3, 'Asignar BonusProgram', 'Automatico', timeRq1, 'Rq1', data, new Date(), 'Rs1', { STATUS_CODE: result.coderror, STATUS_DESC: result.descripcionerror }, (new Date() - timeRq1));
        let dataSave = {
            id_campannia: data.id_campannia,
            id_cuenta: data.id_cuenta,
            estado: result.code == 200 || result.code == 201 ? 1 : 2,
            cod_respuesta: result.code,
            desc_respuesta: result.data,
            fecha_asigna: data.fecha_asigna
        }
        const timeRq2 = new Date();
        operations.postRstasignar_kambi(dataSave, conexion).then(res => {
            loggerManagement.insertLog(3, 'Guardar BonusProgram', 'savePostKambi', timeRq2, 'Rq1', dataSave, new Date(), 'Rs1', res, (new Date() - timeRq2));
        })
    }).catch(err => {
        loggerManagement.insertLog(3, 'Asignar BonusProgram', 'Automatico', timeRq, 'Rq1', data, new Date(), 'Rs1', JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))), (new Date() - timeRq));
    });
};


/**
 * Sube los bonos a kambi
 */
controller.postUploadCampanniaKambi = function() {
    loggerManagement.insertLog(4, 'MasiBonos Kambi', 'Automatico', new Date(), 'Rq1', '', new Date(), 'Rs1', `Se establece el Cron por inicio del servicio para ejecucion cada ${global.configMicroservices.timeFront} minutos`, 1);
    try {
        var task = cron.schedule(`*/${global.configMicroservices.timeFront} * * * *`, () => {
            var timeRq = new Date();
            task.stop();
            const date = new Date();
            const dateProcess = date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
            const timeRq1 = new Date();
            let size = 999;
            let cnt_registros = 999;
            loggerManagement.insertLog(4, 'MasiBonos Kambi', 'Automatico', timeRq, 'Rq1', { date: dateProcess }, new Date(), 'Rs1', 'Se detiene el Cron', (new Date() - timeRq));
            //loggerManagement.insertLog(1, 'Cron schedule', 'Automatico', new Date(), 'Rq1', { date: date.toISOString().replace(/T/, ' ').replace(/\..+/, '') }, new Date(), 'Rs1', `Se inicia el Cron subir campañas a kambi ejecucion cada ${global.configMicroservices.timeFront} minutos`, 1);
            operations.postJackpotGetHeadCampannias(dateProcess).then(async(head) => {
                loggerManagement.insertLog(4, 'MasiBonos Kambi', 'headKambi', new Date(), 'Rq1', { date: dateProcess }, new Date(), 'Rs1', head, (new Date() - timeRq1));
                if (head.status_code != 200) {
                    task.start();
                    loggerManagement.insertLog(4, 'MasiBonos Kambi', 'Automatico', timeRq, 'Rq1', '', new Date(), 'Rs1', 'Se inicia el Cron', (new Date() - timeRq));
                    return;
                } else {
                    if (head.v_campannias.length > 0) {
                        try {
                            head.v_campannias.forEach(async campannia => {
                                if (campannia.CNT_KAMBI == 0) {
                                    const timeRq1a = new Date();
                                    await operations.getJackpotPlayersCampannia(campannia.ID_CAMPANNIA).then(async resultPlayers => {
                                        loggerManagement.insertLog(4, 'MasiBonos Kambi', 'getPlayersCampanniaBach', new Date(), 'Rq1', { ID_CAMPANNIA: campannia.ID_CAMPANNIA}, new Date(), 'Rs1', {status_code: resultPlayers.status_code ,status_desc: resultPlayers.status_desc, usuarios: resultPlayers.v_players.length}, (new Date() - timeRq1a));
                                        if (resultPlayers.v_players.length > 0) {
                                            let timeRq1b = new Date();
                                            let registrosFin = resultPlayers.v_players.length;
                                            let registrosIni = 0;
                                            while (registrosIni <= registrosFin) {
                                                let playerfin = [];
                                                let player12 = [].concat(resultPlayers.v_players.slice(registrosIni,registrosIni+cnt_registros))
                                                player12.forEach(datos => {
                                                    playerfin.push(datos.ID_CUENTA);
                                                })
                                                console.log(playerfin);
                                                loggerManagement.insertLog(4, 'MasiBonos Kambi', 'sendKambiBatch', new Date(), 'Rq1', { setPlayers: playerfin, ID_CAMPANNIA: campannia.ID_CAMPANNIA, TIPOBONO: campannia.TIPOBONO, IDBONO: campannia.IDBONO}, new Date(), 'Rs1', '', (new Date() - timeRq1b));
                                                    await this.sendKambi(playerfin, campannia.ID_CAMPANNIA, campannia.TIPOBONO, campannia.IDBONO);
                                                registrosIni = registrosIni+cnt_registros;
                                            }
                                          
                                            await operations.putUpdateHeadBlibBlib(campannia.ID_CAMPANNIA, 1).then(uploadResult => {
                                                loggerManagement.insertLog(4, 'MasiBonos Kambi', 'updateMasibonosBach', timeRq1, 'Rq1', {}, new Date(), 'Rs1', uploadResult, (new Date() - timeRq1));
                                            }).catch (err => {
                                                console.log(err);
                                                loggerManagement.insertLog(4, 'consultaTransacciones', 'updateMasibonosBach', new Date(), 'Rq1', '', new Date(), 'Rs1', JSON.parse(JSON.stringify(err.message, Object.getOwnPropertyNames(err))), 0);
                                            });;
                                        } 
                                    }).catch (err => {
                                        console.log(err);
                                        loggerManagement.insertLog(4, 'consultaTransacciones', 'getPlayersCampanniaBach', new Date(), 'Rq1', '', new Date(), 'Rs1', JSON.parse(JSON.stringify(err.message, Object.getOwnPropertyNames(err))), 0);
                                    });
                                } else {
                                    await operations.getCampanniasMultiples(campannia.ID_CAMPANNIA).then(async resultMultiples => {
                                        loggerManagement.insertLog(4, 'Cron schedule', 'getCampanniasBachMultiple', new Date(), 'Rq1', (campannia.ID_CAMPANNIA), new Date(), 'Rs1', resultMultiples, (new Date() - timeRq1c));
                                        try {
                                            resultMultiples.detailBonus.forEach(async bonus => {
                                                const timeRq1c = new Date();
                                                await operations.getJackpotPlayersCampanniaMultiple(campannia.ID_CAMPANNIA, bonus.ID_KAMBI).then(async resultPlayers => {
                                                    loggerManagement.insertLog(4, 'Cron schedule', 'getPlayersCampanniaBachMultiple', new Date(), 'Rq1', (campannia.ID_CAMPANNIA, bonus.ID_KAMBI), new Date(), 'Rs1', resultPlayers, (new Date() - timeRq1c));
                                                    if (resultPlayers.v_players.length > 0) {
                                                        let timeRq1b = new Date();
                                                        let registrosFin = resultPlayers.v_players.length;
                                                        let registrosIni = 0;
                                                        while (registrosIni <= registrosFin) {
                                                            let playerfin = [];
                                                            let player12 = [].concat(resultPlayers.v_players.slice(registrosIni,registrosIni+cnt_registros))
                                                            player12.forEach(datos => {
                                                                playerfin.push(datos.ID_CUENTA);
                                                            })
                                                            console.log(playerfin);
                                                            loggerManagement.insertLog(4, 'MasiBonos Kambi', 'sendKambiBatch', new Date(), 'Rq1', (playerfin, campannia.ID_CAMPANNIA, campannia.TIPOBONO, bonus.ID_KAMBI), new Date(), 'Rs1', '', (new Date() - timeRq1b));
                                                            await this.sendKambi(playerfin, campannia.ID_CAMPANNIA, campannia.TIPOBONO, bonus.ID_KAMBI);
                                                            registrosIni = registrosIni+cnt_registros;
                                                        }
                                                        await operations.putUpdateHeadBlibBlib(campannia.ID_CAMPANNIA, 1).then(uploadResult => {
                                                            loggerManagement.insertLog(4, 'kambiFtp', 'updateMasibonosBatchMultiple', timeRq1, 'Rq1', {}, new Date(), 'Rs1', uploadResult, (new Date() - timeRq1));
                                                        }).catch (err => {
                                                            console.log(err);
                                                            loggerManagement.insertLog(4, 'consultaTransacciones', 'updateMasibonosBatchMultiple', new Date(), 'Rq1', '', new Date(), 'Rs1', JSON.parse(JSON.stringify(err.message, Object.getOwnPropertyNames(err))), 0);
                                                        });

                                                    }
                                                }).catch (err => {
                                                    console.log(err);
                                                    loggerManagement.insertLog(4, 'consultaTransacciones', 'getPlayersCampanniaBachMultiple', new Date(), 'Rq1', '', new Date(), 'Rs1', JSON.parse(JSON.stringify(err.message, Object.getOwnPropertyNames(err))), 0);
                                                });
                                            });
                                        } catch (err) {
                                            loggerManagement.insertLog(4, 'Cron schedule', 'postKambi', timeRq1, 'Rq1', '', new Date(), 'Rs1', JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))), (new Date() - timeRq1));
                                        }
                                    }).catch (err => {
                                        console.log(err);
                                        loggerManagement.insertLog(4, 'consultaTransacciones', 'getCampanniasBachMultiple', new Date(), 'Rq1', '', new Date(), 'Rs1', JSON.parse(JSON.stringify(err.message, Object.getOwnPropertyNames(err))), 0);
                                    });
                                }
                            });
                            task.start();
                            loggerManagement.insertLog(4, 'MasiBonos Kambi', 'Automatico', timeRq, 'Rq1', '', new Date(), 'Rs1', 'Se inicia el Cron', (new Date() - timeRq));
                            //return;
                        } catch (err) {
                            loggerManagement.insertLog(4, 'MasiBonos Kambi', 'postKambi', timeRq1, 'Rq1', '', new Date(), 'Rs1', JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))), (new Date() - timeRq1));
                            task.start();
                            loggerManagement.insertLog(4, 'MasiBonos Kambi', 'Automatico', timeRq, 'Rq1', '', new Date(), 'Rs1', 'Se inicia el Cron', (new Date() - timeRq));
                            return;
                        }
                    } else {
                        task.start();
                        loggerManagement.insertLog(4, 'MasiBonos Kambi', 'Automatico', timeRq, 'Rq1', '', new Date(), 'Rs1', 'Se inicia el Cron', (new Date() - timeRq));
                        return;
                    }
                }
                await setTimeout(function() {
                    task.start();
                    loggerManagement.insertLog(4, 'MasiBonos Kambi', 'Automatico', timeRq, 'Rq1', {date: dateProcess}, new Date(), 'Rs1', 'Se inicia el Cron', (new Date() - timeRq));
                }, 60000 * (global.configMicroservices.timeFront - ((new Date().getMinutes() % global.configMicroservices.timeFront) == 0 ? global.configMicroservices.timeFront : (new Date().getMinutes() % global.configMicroservices.timeFront))));
            }).catch (err => {
                console.log(err);
                loggerManagement.insertLog(4, 'consultaTransacciones', 'Automatico', new Date(), 'Rq1', '', new Date(), 'Rs1', JSON.parse(JSON.stringify(err.message, Object.getOwnPropertyNames(err))), 0);
                task.start();
                loggerManagement.insertLog(4, 'MasiBonos Kambi', 'Automatico', timeRq, 'Rq1', '', new Date(), 'Rs1', 'Se inicia el Cron', (new Date() - timeRq));
            });
        });
    } catch (err) {
        console.log(err);
        loggerManagement.insertLog(4, 'consultaTransacciones', 'Automatico', new Date(), 'Rq1', '', new Date(), 'Rs1', JSON.parse(JSON.stringify(err.message, Object.getOwnPropertyNames(err))), 0);
    }
}

/*Carga los bonos a nivel de bash a kambi */
controller.sendKambi =  function(players, id_campannia, tipoBono, idBono) {
    const timeRq1 = new Date(); //Obtiene el timestamp de cuando se recibe la solicitud

    const data = {
        id_campannia: id_campannia,
        playerIds: players,
        customerRef: id_campannia + '-' + Date.now(),
        rewardTemplateId: idBono
    }
    const msg = (tipoBono == 1) ? 'Asignar RewardTemplateBatch' : 'Asignar Bonus ProgramBatch';
    //Bonus Program
    let url ;
    if (tipoBono === 1) {
        // Reward
        url = global.configMicroservices.urlBonusKambiService + 'player/batch/reward';
    } else {
        url = global.configMicroservices.urlBonusKambiService + 'player/batch/assignedbonusprogram';
    }

     operations.postRewardtemplateBach(url, data, tipoBono).then(result => {
        loggerManagement.insertLog(6, msg, 'postKambiBatch', timeRq1, 'Rq1', data, new Date(), 'Rs1', result, (new Date() - timeRq1));

        if (result.code == 201 || result.code == 200) {
            result.data.assigned.forEach(kambiRespond => {
                let dataSave = {
                    id_campannia: data.id_campannia,
                    id_cuenta: kambiRespond.playerId,
                    estado: result.code == 200 || result.code == 201 ? 1 : 2,
                    cod_respuesta: result.code,
                    desc_respuesta: kambiRespond.status //JSON.stringify({status:kambiRespond.status})//JSON.stringify(kambiRespond)
                }
                loggerManagement.insertLog(6, msg, 'postKambiBatch', timeRq1, 'Rq1', data, new Date(), 'Rs1', dataSave, (new Date() - timeRq1));
                const timeRq2 = new Date();
                operations.postSaveKambiDet(dataSave).then(res => {
                    loggerManagement.insertLog(6, 'Guardar RewardTemplateBatch', 'PostSaveKambiBatch', timeRq2, 'Rq1', dataSave, new Date(), 'Rs1', res, (new Date() - timeRq2));

                }).catch(err => {
                    loggerManagement.insertLog(6, msg, 'postKambiErrorBatch', timeRq1, 'Rq1', data, new Date(), 'Rs1', JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))), (new Date() - timeRq1));
                });;
            });
        } else {
            loggerManagement.insertLog(6, msg, 'postKambiBatch', timeRq1, 'Rq1', data, new Date(), 'Rs1', result.data, (new Date() - timeRq1));
        }

    }).catch(err => {
        loggerManagement.insertLog(6, msg, 'postKambiErrorBatch', timeRq1, 'Rq1', data, new Date(), 'Rs1', JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))), (new Date() - timeRq1));
    });
}

/**
 * Ënvia la campaña a kambi 
 */

controller.setBlibBlibFtp = function() {
    loggerManagement.insertLog(2, 'kambiFtp', 'Automatico', new Date(), 'Rq1', {}, new Date(), 'Rs1', `Se inicia el Cron subir ftp blib_blib ejecucion cada ${global.configMicroservices.timeFront} minutos`, 1);
    try {
        var task = cron.schedule(`*//*${global.configMicroservices.timeFront} * * * *`, () => {
            var timeRq = new Date();

            task.stop();
            loggerManagement.insertLog(2, 'kambiFtp', 'Automatico', timeRq, 'Rq1', '', new Date(), 'Rs1', 'Se detiene el Cron', (new Date() - timeRq));
            const timeRq1 = new Date(); 
            //----------- Buscamos las credenciales del sftp-----------------//
            operations.getCredFtp().then(async(ftpReult) => {
                loggerManagement.insertLog(2, 'kambiFtp', '', new Date(), 'Rq1', '', new Date(), 'Rs1', ftpReult.p_campannias, 1);
                if (ftpReult.STATUS_CODE != 200) {
                    loggerManagement.insertLog(2, 'kambiFtp', 'Automatico', timeRq1, 'Rq1', '', new Date(), 'Rs1', { STATUS_CODE: result.CODERROR, STATUS_DESC: 'No se encontraron transacciones en estado pendiente', DATA: result.detailPlayer }, (new Date() - timeRq1));
                    task.start();
                    loggerManagement.insertLog(2, 'kambiFtp', 'Automatico', timeRq, 'Rq1', '', new Date(), 'Rs1', 'Se inicia el Cron', (new Date() - timeRq));
                    return;
                } else {
                    const ftpConfig = JSON.parse(ftpReult.p_ftp_config);
                    if (ftpReult.p_campannias.length > 0) {
                        await ftpReult.p_campannias.forEach(async(campannia) => {
                            let players = [];
                            await operations.postJackpotGetCampanniasBlibBlib(campannia.ID_CAMPANNIA).then(async result => {
                                if (result.status_code == 200) {
                                    await result.v_campannias_kambi.forEach(async campanniaKambi => {
                                        if (campanniaKambi.CODRESPUESTA != null && campanniaKambi.CODRESPUESTA == 201) {
                                            await players.push({ 'TELEFONO': campanniaKambi.TELEFONO, 'NOMBRE': campanniaKambi.NOMBRE, 'VALOR': campanniaKambi.VALOR, 'MESSAGE': campanniaKambi.MESSAGE, 'FECHA': campanniaKambi.FECHA });
                                        }
                                    });
    
                                    if (players.length > 0) {
                                        loggerManagement.insertLog(2, 'kambiFtp', '', new Date(), 'Rq1', {}, new Date(), 'Rs1', players, 1);
    
                                        const clientsftp = new Client();
                                        const arraySms = [];
                                        const date = new Date().toISOString().replace(/T/, '_').replace(/:/g, '').replace(/-/g, '').replace(/\..+/, '');
                                        const tCampos = Object.keys(players[0]).length - 2; //se resta telefono y mensaje;
                                        // --------sftp--------//
                                        await clientsftp.connect({
                                            host: global.configMicroservices.ftpConfig.ht,
                                            user: global.configMicroservices.ftpConfig.user,
                                            password: global.configMicroservices.ftpConfig.pass,
                                            port: global.configMicroservices.ftpConfig.port
                                        }).then(p => {
                                            arraySms.push(`${tCampos}|${players[0].MESSAGE}`); // primera linea
                                            players.forEach((bono) => {
                                                const phone = bono.TELEFONO.replace(/(\r\n|\n|\r)/gm, "");
                                                if (phone.length == 10) {
                                                    arraySms.push(`${bono.TELEFONO}|${bono.NOMBRE}|${bono.VALOR}|${moment(bono.FECHA).format('DDMMYYYYHHmmss')}`);
                                                }
                                            });
                                            loggerManagement.insertLog(2, 'kambiFtp', '', new Date(), 'Rq1', {}, new Date(), 'Rs1', { 'file': "CEM_SMS_" + date + ".csv", 'path': global.configMicroservices.ftpConfig.path }, 1);
                                            var file = fs.createWriteStream('uploads/sms_' + date + '.csv');
                                            file.on('error', function(err) { /* error handling*/ });
                                            arraySms.forEach(function(v) { file.write(v + '\n'); });
                                            file.end();
                                            clientsftp.put("uploads/sms_" + date + ".csv", global.configMicroservices.ftpConfig.path + "/CEM_SMS_" + date + ".csv");
    
                                            operations.putUpdateHeadBlibBlib(campannia.ID_CAMPANNIA, 2).then(uploadResult => {
                                                loggerManagement.insertLog(2, 'kambiFtp', 'updateMasibonos', timeRq1, 'Rq1', {}, new Date(), 'Rs1', uploadResult, (new Date() - timeRq1));
                                            }).catch((err) => {
                                                loggerManagement.insertLog(2, 'kambiFtp', 'postFtpError', timeRq1, 'Rq1', {}, new Date(), 'Rs1', JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))), (new Date() - timeRq1));
                                            });
                                        }).catch(err => {
                                            loggerManagement.insertLog(2, 'kambiFtp', 'postFtpError', timeRq1, 'Rq1', {}, new Date(), 'Rs1', JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))), (new Date() - timeRq1));
                                        });
                                    }
                                }
                            }).catch((err) => {
                                loggerManagement.insertLog(2, 'kambiFtp', 'postFtpError', timeRq1, 'Rq1', {}, new Date(), 'Rs1', JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))), (new Date() - timeRq1));
                            });
                        });
                        task.start();
                        loggerManagement.insertLog(2, 'kambiFtp', 'Automatico', timeRq, 'Rq1', '', new Date(), 'Rs1', 'Se inicia el Cron', (new Date() - timeRq));
                    } else {
                        task.start();
                        loggerManagement.insertLog(2, 'kambiFtp', 'Automatico', timeRq, 'Rq1', '', new Date(), 'Rs1', 'Se inicia el Cron', (new Date() - timeRq));
                    }
                }
                await setTimeout(function() {
                    task.start();
                    loggerManagement.insertLog(2, 'kambiFtp', 'Automatico', timeRq, 'Rq1', '', new Date(), 'Rs1', 'Se inicia el Cron', (new Date() - timeRq));
                }, 60000 * (global.configMicroservices.timeFront - ((new Date().getMinutes() % global.configMicroservices.timeFront) == 0 ? global.configMicroservices.timeFront : (new Date().getMinutes() % global.configMicroservices.timeFront))));
            }).catch((err) => {
                loggerManagement.insertLog(2, 'kambiFtp', 'postFtpError', timeRq1, 'Rq1', {}, new Date(), 'Rs1', JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))), (new Date() - timeRq1));
            });
        });
    } catch (err) {
        loggerManagement.insertLog(2, 'kambiFtp', 'Automatico', new Date(), 'Rq1', '', new Date(), 'Rs1', JSON.parse(JSON.stringify(err.message, Object.getOwnPropertyNames(err))), 0);
    }
}

controller.sendTarjetaSisred = function() {
    loggerManagement.insertLog(0, 'Tarjetas Sisred Pendientes', 'Automatico', new Date(), 'Rq1', '', new Date(), 'Rs1', `Se establece el Cron por inicio del servicio para ejecucion cada ${global.configMicroservices.timeFront} minutos`, 1);
    try {
        var task = cron.schedule(`*/${global.configMicroservices.timeFront} * * * *`, () => {
            var timeRq = new Date();

            task.stop();
            loggerManagement.insertLog(0, 'RT sisred pendiente', 'Automatico', timeRq, 'Rq1', '', new Date(), 'Rs1', 'Se detiene el Cron', (new Date() - timeRq));

            const timeRq1 = new Date();
            operations.validaPendientes().then(result => {
                    loggerManagement.insertLog(0, 'consultaTransacciones', 'Automatico', timeRq1, 'Rq1', '', new Date(), 'Rs1', result, (new Date() - timeRq1));
                    task.start();
                    loggerManagement.insertLog(0, 'Tarjetas Sisred Pendientes', 'Automatico', timeRq, 'Rq1', '', new Date(), 'Rs1', 'Se inicia el Cron', (new Date() - timeRq));
                    return;
            }).catch(err => {
                loggerManagement.insertLog(0, 'consultaTransacciones', 'Automatico', timeRq1, 'Rq1', '', new Date(), 'Rs1', JSON.parse(JSON.stringify(err.message, Object.getOwnPropertyNames(err))), (new Date() - timeRq1));
                task.start();
                loggerManagement.insertLog(0, 'Tarjetas Sisred Pendientes', 'Automatico', timeRq, 'Rq1', '', new Date(), 'Rs1', 'Se inicia el Cron', (new Date() - timeRq));
            });
        });
    } catch (err) {
        loggerManagement.insertLog(0, 'consultaTransacciones', 'Automatico', new Date(), 'Rq1', '', new Date(), 'Rs1', JSON.parse(JSON.stringify(err.message, Object.getOwnPropertyNames(err))), 0);
    }
}

controller.assignTarjetaSisred = function() {
    loggerManagement.insertLog(1, 'Asignar Tarjetas Pendientes ', 'Automatico', new Date(), 'Rq1', '', new Date(), 'Rs1', `Se establece el Cron por inicio del servicio para ejecucion cada ${global.configMicroservices.timeFront} minutos`, 1);
    try {
        var task = cron.schedule(`*/${global.configMicroservices.timeFront} * * * *`, () => {
            var timeRq = new Date();

            task.stop();
            loggerManagement.insertLog(1, 'Asignar Tarjetas Pendientes ', 'Automatico', timeRq, 'Rq1', '', new Date(), 'Rs1', 'Se detiene el Cron', (new Date() - timeRq));

            const timeRq1 = new Date();
            operations.assignTarjetaSisred().then(async(result) => {
                if (result.detailPlayer.length == 0) {
                    loggerManagement.insertLog(1, 'Asignar Tarjetas Pendientes ', 'Automatico', timeRq1, 'Rq1', '', new Date(), 'Rs1', { STATUS_CODE: result.CODERROR, STATUS_DESC: 'No se encontraron tarjetas en estado pendiente', DATA: result.detailPlayer }, (new Date() - timeRq1));
                    task.start();
                    loggerManagement.insertLog(1, 'Asignar Tarjetas Pendientes ', 'Automatico', timeRq, 'Rq1', '', new Date(), 'Rs1', 'Se inicia el Cron', (new Date() - timeRq));
                    return;
                } else {
                    loggerManagement.insertLog(1, 'Asignar Tarjetas Pendientes ', 'Automatico', timeRq1, 'Rq1', '', new Date(), 'Rs1', { STATUS_CODE: result.CODERROR, STATUS_DESC: result.DESCRIPCIONERROR, DATA: result.detailPlayer }, (new Date() - timeRq1));
                    let conexion = 2;
                    for (let i = 0; i < result.detailPlayer.length; i++) {
                        let fecha_reg = moment(result.detailPlayer[i].FECHA_ASIGNACION).format('DDMMYYYYHHmmss');
                        let aleatoreo = Math.random().toString(36).substr(-5);
                        let bodyRq = {
                            id_campannia: result.detailPlayer[i].ID_CAMPANNIA,
                            customerRef: (aleatoreo + '-' + result.detailPlayer[i].ID_CAMPANNIA.toString().padStart(7, 0) + '-' + fecha_reg), //result.detailPlayer[i].CODSEGURI),
                            id_cuenta: result.detailPlayer[i].ID_PLAYER,
                            rewardTemplateId: result.detailPlayer[i].ID_BONO,
                            criteria: ' ',
                            fecha_asigna : result.detailPlayer[i].FECHA_ASIGNACION

                        };
                        if (result.detailPlayer[i].TIPOBONO == 24) {
                            await controller.postRewardtemplate(bodyRq, conexion);
                        } else {
                            await controller.postBonusProgram(bodyRq, conexion);
                        }
                    };
                    task.start();
                    loggerManagement.insertLog(1, 'Asignar Tarjetas Pendientes ', 'Automatico', timeRq, 'Rq1', '', new Date(), 'Rs1', 'Se inicia el Cron', (new Date() - timeRq));
                };

                await setTimeout(function() {
                    task.start();
                    loggerManagement.insertLog(1, 'Asignar Tarjetas Pendientes ', 'Automatico', timeRq, 'Rq1', '', new Date(), 'Rs1', 'Se inicia el Cron', (new Date() - timeRq));
                }, 60000 * (global.configMicroservices.timeFront - ((new Date().getMinutes() % global.configMicroservices.timeFront) == 0 ? global.configMicroservices.timeFront : (new Date().getMinutes() % global.configMicroservices.timeFront))));
            }).catch(err => {
                loggerManagement.insertLog(1, 'Asignar Tarjetas Pendientes ', 'Automatico', timeRq1, 'Rq1', '', new Date(), 'Rs1', JSON.parse(JSON.stringify(err.message, Object.getOwnPropertyNames(err))), (new Date() - timeRq1));
                task.start();
                loggerManagement.insertLog(1, 'Asignar Tarjetas Pendientes ', 'Automatico', timeRq, 'Rq1', '', new Date(), 'Rs1', 'Se inicia el Cron', (new Date() - timeRq));
            });
        });
    } catch (err) {
        loggerManagement.insertLog(1, 'Asignar Tarjetas Pendientes ', 'Automatico', new Date(), 'Rq1', '', new Date(), 'Rs1', JSON.parse(JSON.stringify(err.message, Object.getOwnPropertyNames(err))), 0);
    }
}

module.exports = controller;