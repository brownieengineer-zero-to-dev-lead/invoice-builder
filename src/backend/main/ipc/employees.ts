import { ipcMain } from 'electron';
import * as employeesService from '../../shared/services/employees';
import type { DatabaseAdapter } from '../../shared/types/DatabaseAdapter';
import type { Employee } from '../../shared/types/employee';

export const initEmployeesHandlers = (db: DatabaseAdapter) => {
  ipcMain.handle('get-all-employees', async (_event, showArchived?: boolean) =>
    employeesService.getAllEmployees(db, showArchived)
  );
  ipcMain.handle('get-employee-by-id', async (_event, id: number) =>
    employeesService.getEmployeeById(db, id)
  );
  ipcMain.handle('add-employee', async (_event, data: Employee) =>
    employeesService.addEmployee(db, data)
  );
  ipcMain.handle('update-employee', async (_event, data: Employee) =>
    employeesService.updateEmployee(db, data)
  );
  ipcMain.handle('delete-employee', async (_event, id: number) =>
    employeesService.deleteEmployee(db, id)
  );
};
