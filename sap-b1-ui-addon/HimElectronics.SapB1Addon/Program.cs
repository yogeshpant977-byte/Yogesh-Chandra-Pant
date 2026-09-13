using System;
using SAPbouiCOM;
using SAPbouiCOM.Framework;
using SAPbobsCOM;

namespace HimElectronics.SapB1Addon
{
    /// <summary>
    /// Entry point for the Him Electronics SAP Business One UI Add-on.
    /// Connects to the running SAP B1 client (started by the add-in loader,
    /// which passes the connection string as argv[0]) against the company
    /// database ZZZ_HPL_LIVE_29082026.
    /// </summary>
    internal static class Program
    {
        private static SAPbouiCOM.Application _application;
        private static Company _company;
        private static MenuHandler _menuHandler;

        [STAThread]
        private static void Main(string[] args)
        {
            if (args.Length == 0)
            {
                Console.Error.WriteLine("This add-on must be launched by the SAP B1 client (no connection string supplied).");
                return;
            }

            try
            {
                var connectionString = args[0];
                var sboGuiApi = new SboGuiApi();
                sboGuiApi.Connect(connectionString);
                _application = sboGuiApi.GetApplication();

                _company = (Company)_application.Company.GetDIAPICompanyObject();
                _company.Connect();

                Console.WriteLine($"Him Electronics add-on connected to company DB: {_company.CompanyDB}");

                _menuHandler = new MenuHandler(_application);
                _menuHandler.AddCustomMenus();

                _application.AppEvent += OnAppEvent;
                _application.MenuEvent += _menuHandler.OnMenuEvent;

                System.Windows.Forms.Application.Run();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Fatal error in Him Electronics add-on: {ex}");
            }
        }

        private static void OnAppEvent(BoAppEventTypes eventType)
        {
            if (eventType == BoAppEventTypes.aet_ShutDown || eventType == BoAppEventTypes.aet_CompanyChanged)
            {
                System.Windows.Forms.Application.Exit();
            }
        }
    }
}
