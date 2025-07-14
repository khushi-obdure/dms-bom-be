import { message } from "@utils/message";
import { logger } from "@utils/logger";
import PlantDaos from "@/daos/plant.daos";
import { Plant } from "@/interfaces/plant.interface";
import {
    NotFoundHttpException,
    HttpException,
} from "@exceptions/HttpException";

class PlantService {
    public plantDaos = new PlantDaos()


    /**
    * Get Plant
    * @param reqData
    * @returns {Promise<Plant[]>}
    */
    public getPlant = async (): Promise<Plant> => {
        logger.info({
            message: "Starting Get Plant Data",
            context: "PlantService",
            method: "getPlant",
        });
        try {
            const getData = await this.plantDaos.findAllPlant();
            if (!getData)
                throw new NotFoundHttpException(message.general.dataNotFound);

            logger.info({
                message: "Template creation completed",
                context: "PlantService",
                method: "getPlant",
            });
            return getData;
        } catch (error) {
            logger.error({
                error: error?.message || "Error during template creation",
                context: "PlantService",
                method: "getPlant",
            });
            throw new HttpException(
                500,
                error?.message || message.general.serverError
            );
        }
    };
}

export default PlantService