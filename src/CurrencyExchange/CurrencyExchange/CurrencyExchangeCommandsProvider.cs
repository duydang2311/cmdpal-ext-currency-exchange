// Copyright (c) Microsoft Corporation
// The Microsoft Corporation licenses this file to you under the MIT license.
// See the LICENSE file in the project root for more information.

using CurrencyExchange.Pages;
using Microsoft.CommandPalette.Extensions;
using Microsoft.CommandPalette.Extensions.Toolkit;
using System;

namespace CurrencyExchange;

public partial class CurrencyExchangeCommandsProvider : CommandProvider
{
    private readonly IFallbackCommandItem[] fallbacks = [new FallbackCurrencyExchangeItem()];

    public CurrencyExchangeCommandsProvider()
    {
        DisplayName = "Currency Exchange";
        Icon = IconHelpers.FromRelativePath("Assets\\StoreLogo.png");
    }

    public override ICommandItem[] TopLevelCommands()
    {
        return Array.Empty<ICommandItem>();
    }

    public override IFallbackCommandItem[] FallbackCommands() => fallbacks;
}
