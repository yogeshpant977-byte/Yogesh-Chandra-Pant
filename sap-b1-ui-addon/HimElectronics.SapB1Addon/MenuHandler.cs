using System;
using SAPbouiCOM;

namespace HimElectronics.SapB1Addon
{
    /// <summary>
    /// Adds a "Him Electronics" top-level menu with sample custom actions,
    /// and routes SAP B1 menu clicks to them. Extend this class with the
    /// specific screens/workflows Him Electronics needs (e.g. a custom
    /// dashboard, a bulk-import screen, or a report launcher).
    /// </summary>
    internal sealed class MenuHandler
    {
        private const string RootMenuId = "HE_ROOT";
        private const string SampleFormMenuId = "HE_SAMPLE_FORM";

        private readonly SAPbouiCOM.Application _application;

        public MenuHandler(SAPbouiCOM.Application application)
        {
            _application = application;
        }

        public void AddCustomMenus()
        {
            var menus = _application.Menus;

            if (menus.Exists(RootMenuId))
            {
                return;
            }

            var modulesMenu = menus.Item("40218"); // "Modules" top-level menu item
            var creationParams = (MenuCreationParams)_application.CreateObject(BoCreatableObjectType.cot_MenuCreationParams);

            creationParams.Type = BoMenuType.mt_POPUP;
            creationParams.UniqueID = RootMenuId;
            creationParams.String = "Him Electronics";
            creationParams.Position = -1;
            modulesMenu.SubMenus.AddEx(creationParams);

            var himMenu = menus.Item(RootMenuId);
            creationParams.Type = BoMenuType.mt_STRING;
            creationParams.UniqueID = SampleFormMenuId;
            creationParams.String = "Sample Screen";
            creationParams.Position = -1;
            himMenu.SubMenus.AddEx(creationParams);
        }

        public void OnMenuEvent(ref MenuEvent pVal, out bool bubbleEvent)
        {
            bubbleEvent = true;

            if (pVal.BeforeAction || pVal.MenuUID != SampleFormMenuId)
            {
                return;
            }

            try
            {
                // TODO: replace with the real Him Electronics screen/workflow.
                _application.MessageBox("Him Electronics add-on is connected to ZZZ_HPL_LIVE_29082026.");
            }
            catch (Exception ex)
            {
                _application.MessageBox($"Him Electronics add-on error: {ex.Message}");
            }
        }
    }
}
