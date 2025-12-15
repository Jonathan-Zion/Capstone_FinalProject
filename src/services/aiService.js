import { getFleetStatus, getProductionStats, getLogisticsChain, updateFleetStatus } from '../data/mockData.js';
import { logger } from '../utils/logger.js';

export const analyzeConditions = (weather, roadCondition = 'dry') => {
    const fleet = getFleetStatus();
    const production = getProductionStats();

    // Default response
    let recommendation = {
        status: 'NORMAL',
        message: 'Operations running smoothly.',
        action: null
    };


    if (weather.condition === 'Storm' && fleet.active > 0) {
        return {
            status: 'CRITICAL',
            message: '⚠️ Storm detected! Unsafe conditions for hauling.',
            action: 'STOP_OPERATIONS',
            description: 'Suspend all pit operations and return trucks to standby.'
        };
    }


    if (roadCondition === 'muddy') {
        return {
            status: 'CRITICAL',
            message: '⛔ Road requires maintenance. Risk of sliding.',
            action: 'STOP_OPERATIONS',
            description: 'Roads reported as muddy/slippery. Haul trucks cannot operate safely.'
        };
    }

    if (roadCondition === 'wet' && weather.condition !== 'Clear') {
        return {
            status: 'WARNING',
            message: '⚠️ Wet roads and poor visibility.',
            action: null,
            description: 'Reduce speed limit to 40km/h. Exercise extreme caution.'
        };
    }


    const currentProd = parseInt(production.coalOutput.value.replace(/,/g, '').replace(' T', '')) || 0;
    const targetProd = 50000;

    if (weather.condition === 'Clear' && roadCondition === 'dry' && currentProd < targetProd && fleet.standby > 0) {
        return {
            status: 'OPTIMIZATION',
            message: '📉 Production below target. Conditions optimal.',
            action: 'DEPLOY_STANDBY',
            description: `Deploy ${fleet.standby} standby trucks to increase output.`
        };
    }


    if (fleet.breakdown >= 3) {
        return {
            status: 'WARNING',
            message: '🔧 High number of vehicle breakdowns detected.',
            action: 'SCHEDULE_MAINTENANCE',
            description: 'Prioritize workshop scheduling for breakdown units.'
        };
    }

    return recommendation;
};

export const executeAction = (action) => {
    const fleet = getFleetStatus();

    if (action === 'STOP_OPERATIONS') {

        const activeVehicles = fleet.vehicles.filter(v => v.status === 'active');
        activeVehicles.forEach(v => {
            v.status = 'standby';
            v.location = 'Parking Lot';
        });

        // Update counts
        fleet.standby += fleet.active;
        fleet.active = 0;

        updateFleetStatus(fleet);
        logger.info('AI Executed: STOP_OPERATIONS');
        return { success: true, message: 'All units moved to standby.' };
    }

    if (action === 'DEPLOY_STANDBY') {
        // Move standby to active
        const standbyVehicles = fleet.vehicles.filter(v => v.status === 'standby');
        const count = standbyVehicles.length;

        standbyVehicles.forEach(v => {
            v.status = 'active';
            v.location = 'Allocated Pit';
        });

        // Update counts
        fleet.active += count;
        fleet.standby -= count;

        updateFleetStatus(fleet);
        logger.info(`AI Executed: DEPLOY_STANDBY (${count} units)`);
        return { success: true, message: `${count} units deployed to active duty.` };
    }

    return { success: false, message: 'Unknown action or manual intervention required.' };
};
