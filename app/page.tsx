'use client';

import React, { useState, useEffect, useMemo } from 'react';

type AccountType =
  | 'Asset'
  | 'Liability'
  | 'Equity'
  | 'Income'
  | 'Expense';

type TransactionScope =
  | 'BIR ONLY'
  | 'IN HOUSE ONLY'
  | 'BIR & INHOUSE';

interface Account {
  id: string;
  name: string;
  type: AccountType;
}

interface TinRegistry {
  id: string;
  tin: string;
  vatOwner: string;
  nonVatOwner: string;
  address: string;
}

interface DoubleEntry {
  id: string;
  date: string;
  particulars: string;
  refNo: string;
  tin?: string;
  vatOwner?: string;
  nonVatOwner?: string;
  address?: string;
  transactionScope: TransactionScope;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  grossAmount?: number;
  vatExclusive?: number;
  vatAmount?: number;
  isVoided?: boolean;
}

const DEFAULT_ACCOUNTS: Account[] = [
  { id: '1', name: 'CASH ON HAND', type: 'Asset' },
  { id: '2', name: 'CASH IN BANK', type: 'Asset' },
  { id: '3', name: 'SALES INCOME', type: 'Income' },
  { id: '4', name: 'SALARIES', type: 'Expense' },
  { id: '5', name: 'FUEL - TRANSPO', type: 'Expense' },
  {
    id: '6',
    name: 'REPAIRS AND MAINTENANCE',
    type: 'Expense',
  },
  { id: '7', name: 'OFFICE SUPPLIES', type: 'Expense' },
  {
    id: '8',
    name: 'KITCHEN SUPPLIES - SOLANE',
    type: 'Expense',
  },
  { id: '9', name: 'KITCHEN SUPPLIES', type: 'Expense' },
  { id: '10', name: 'PROFESSIONAL FEES', type: 'Expense' },
  { id: '11', name: 'UTILITIES', type: 'Expense' },
  { id: '12', name: 'MEDICINES', type: 'Expense' },
  { id: '13', name: 'REPRESENTATION', type: 'Expense' },
  { id: '14', name: 'MISC.', type: 'Expense' },
];

const MONTHS = [
  { value: '01', label: '01 - Jan' },
  { value: '02', label: '02 - Feb' },
  { value: '03', label: '03 - Mar' },
  { value: '04', label: '04 - Apr' },
  { value: '05', label: '05 - May' },
  { value: '06', label: '06 - Jun' },
  { value: '07', label: '07 - Jul' },
  { value: '08', label: '08 - Aug' },
  { value: '09', label: '09 - Sep' },
  { value: '10', label: '10 - Oct' },
  { value: '11', label: '11 - Nov' },
  { value: '12', label: '12 - Dec' },
];

const formatAmount = (amount: number) =>
  `₱${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function BookkeepingApp() {
  const [accounts, setAccounts] =
    useState<Account[]>(DEFAULT_ACCOUNTS);

  const [entries, setEntries] =
    useState<DoubleEntry[]>([]);

  const [tinRegistry, setTinRegistry] =
    useState<TinRegistry[]>([]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [activeTab, setActiveTab] = useState<
    | 'entry'
    | 'tinRegistry'
    | 'receipts'
    | 'disbursements'
    | 'journal'
    | 'ledger'
    | 'birOnlyBooks'
    | 'birInhouseBooks'
    | 'inhouse'
    | 'reports'
    | 'settings'
  >('entry');

  
useEffect(() => {
  const style = document.createElement("style");

  style.innerHTML = `
    /* ================================
       STRONG GLOBAL CLICK HIGHLIGHT
       ================================ */

    .global-click-highlight {
      background-color: #dbeafe !important;
      border-color: #2563eb !important;
      box-shadow:
        inset 5px 0 0 #2563eb,
        0 0 0 2px rgba(37, 99, 235, 0.20) !important;
      transition: all 0.15s ease !important;
    }

    /* Inputs / Selects / Textareas */
    input.global-click-highlight,
    select.global-click-highlight,
    textarea.global-click-highlight {
      background-color: #dbeafe !important;
      border: 2px solid #2563eb !important;
      box-shadow:
        0 0 0 3px rgba(37, 99, 235, 0.18) !important;
    }

    /* Buttons */
    button.global-click-highlight,
    [role="button"].global-click-highlight {
      background-color: #bfdbfe !important;
      border: 2px solid #2563eb !important;
      color: #1e3a8a !important;
      box-shadow:
        0 0 0 3px rgba(37, 99, 235, 0.20) !important;
    }

    /* Table rows */
    tr.global-click-highlight {
      background-color: #dbeafe !important;
      box-shadow:
        inset 6px 0 0 #2563eb !important;
    }

    tr.global-click-highlight > td,
    tr.global-click-highlight > th {
      background-color: #dbeafe !important;
    }

    /* General clickable items */
    .global-click-highlight {
      outline: 2px solid #2563eb !important;
      outline-offset: -2px !important;
    }
  `;

  document.head.appendChild(style);

  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    /* Remove old highlight */
    document
      .querySelectorAll(".global-click-highlight")
      .forEach((el) => {
        el.classList.remove("global-click-highlight");
      });

    /* Find clicked item */
    const clicked = target.closest(
      "button, input, select, textarea, tr, td, th, [role='button'], [role='tab'], a, label"
    ) as HTMLElement | null;

    if (!clicked) return;

    /* If inside a table, highlight entire row */
    const row = clicked.closest("tr") as HTMLElement | null;

    if (row) {
      row.classList.add("global-click-highlight");
      return;
    }

    /* Highlight clicked item */
    clicked.classList.add("global-click-highlight");
  };

  document.addEventListener("click", handleClick);

  return () => {
    document.removeEventListener("click", handleClick);
    style.remove();
  };
}, []);
  
  // ============================================================
  // DATE FILTER
  // ============================================================

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // ============================================================
  // HYDRATION-SAFE LOCAL STORAGE LOAD
  // ============================================================

  useEffect(() => {
    try {
      const savedAccounts =
        localStorage.getItem('bir_accounts_v8');

      const savedEntries =
        localStorage.getItem('bir_entries_v8');

      const savedTinRegistry =
        localStorage.getItem('bir_tin_registry_v1');

      if (savedAccounts) {
        setAccounts(JSON.parse(savedAccounts));
      }

      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      }

      if (savedTinRegistry) {
        setTinRegistry(JSON.parse(savedTinRegistry));
      }
    } catch (error) {
      console.error(
        'Failed to load saved accounting data:',
        error
      );
    }

    setIsLoaded(true);
  }, []);

  // ============================================================
  // PERSISTENT SAVE - ACCOUNTS
  // ============================================================

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        'bir_accounts_v8',
        JSON.stringify(accounts)
      );
    }
  }, [accounts, isLoaded]);

  // ============================================================
  // PERSISTENT SAVE - ENTRIES
  // ============================================================

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        'bir_entries_v8',
        JSON.stringify(entries)
      );
    }
  }, [entries, isLoaded]);


  // ============================================================
  // PERSISTENT SAVE - TIN REGISTRY
  // ============================================================

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        'bir_tin_registry_v1',
        JSON.stringify(tinRegistry)
      );
    }
  }, [tinRegistry, isLoaded]);

  // ============================================================
  // ACCOUNT SETTINGS FORM
  // ============================================================

  const [newAccountName, setNewAccountName] =
    useState('');

  const [newAccountType, setNewAccountType] =
    useState<AccountType>('Expense');

  // ============================================================
  // CHART OF ACCOUNTS ACTIONS
  // ============================================================

  const [editingAccountId, setEditingAccountId] =
    useState<string | null>(null);

  const [editingAccountName, setEditingAccountName] =
    useState('');

  const [editingAccountType, setEditingAccountType] =
    useState<AccountType>('Expense');

  // ============================================================
  // TRANSACTION DATE
  // ============================================================

  const today = new Date();

  const [txMonth, setTxMonth] = useState(
    String(today.getMonth() + 1).padStart(2, '0')
  );

  const [txDay, setTxDay] = useState(
    String(today.getDate()).padStart(2, '0')
  );

  const [txYear, setTxYear] = useState(
    String(today.getFullYear())
  );

  // ============================================================
  // DOUBLE ENTRY FORM
  // ============================================================

  const [txParticulars, setTxParticulars] =
    useState('');

  const [txRefNo, setTxRefNo] =
    useState('');

  const [txTin, setTxTin] =
    useState('');

  const [txVatOwner, setTxVatOwner] =
    useState('');

  const [txNonVatOwner, setTxNonVatOwner] =
    useState('');

  const [txAddress, setTxAddress] =
    useState('');

  const [txScope, setTxScope] =
    useState<TransactionScope>(
      'BIR & INHOUSE'
    );

  const [txDebitAcc, setTxDebitAcc] =
    useState('CASH ON HAND');

  const [txCreditAcc, setTxCreditAcc] =
    useState('SALES INCOME');

  const [txAmount, setTxAmount] =
    useState('');

  const [tinRegistryTin, setTinRegistryTin] = useState('');
  const [tinRegistryVatOwner, setTinRegistryVatOwner] = useState('');
  const [tinRegistryNonVatOwner, setTinRegistryNonVatOwner] = useState('');
  const [tinRegistryAddress, setTinRegistryAddress] = useState('');
  const [editingTinRegistryId, setEditingTinRegistryId] = useState<string | null>(null);
  const [showTinRegisterForm, setShowTinRegisterForm] = useState(false);
  const [showTinRegisterModal, setShowTinRegisterModal] = useState(false);

  const tinRegistryMatch = useMemo(() => {
    const normalizedTin = txTin.trim().toUpperCase();
    if (!normalizedTin) return undefined;
    return tinRegistry.find(
      (item) => item.tin.trim().toUpperCase() === normalizedTin
    );
  }, [txTin, tinRegistry]);

  // Automatic TIN suggestions while the user is typing.
  // Exact matches are handled separately by tinRegistryMatch.
  const tinSuggestions = useMemo(() => {
    const normalizedTin = txTin.trim().toUpperCase();

    if (!normalizedTin || tinRegistryMatch) {
      return [];
    }

    return tinRegistry
      .filter((item) =>
        item.tin.trim().toUpperCase().startsWith(normalizedTin)
      )
      .slice(0, 8);
  }, [txTin, tinRegistry, tinRegistryMatch]);

  const grossAmountNum = parseFloat(txAmount) || 0;
  const hasVatOwner = txVatOwner.trim() !== '';
  const vatExclusiveAmount =
    hasVatOwner && grossAmountNum > 0
      ? grossAmountNum / 1.12
      : 0;
  const vatAmount =
    hasVatOwner && grossAmountNum > 0
      ? vatExclusiveAmount * 0.12
      : 0;

  const handleTinChange = (value: string) => {
    const normalizedTin = value.trim().toUpperCase();
    setTxTin(value);

    if (!normalizedTin) {
      setTxVatOwner('');
      setTxNonVatOwner('');
      setTxAddress('');
      return;
    }

    const match = tinRegistry.find(
      (item) => item.tin.trim().toUpperCase() === normalizedTin
    );

    if (match) {
      setTxVatOwner(match.vatOwner);
      setTxNonVatOwner(match.nonVatOwner);
      setTxAddress(match.address);
    } else {
      // Prevent information from a previously selected/registered TIN
      // from remaining attached to a different, unregistered TIN.
      setTxVatOwner('');
      setTxNonVatOwner('');
      setTxAddress('');
    }
  };

  const selectTinSuggestion = (item: TinRegistry) => {
    setTxTin(item.tin);
    setTxVatOwner(item.vatOwner);
    setTxNonVatOwner(item.nonVatOwner);
    setTxAddress(item.address);
  };

  const resetTinRegistryForm = () => {
    setTinRegistryTin('');
    setTinRegistryVatOwner('');
    setTinRegistryNonVatOwner('');
    setTinRegistryAddress('');
    setEditingTinRegistryId(null);
  };

  const handleSaveTinRegistry = (e: React.FormEvent) => {
    e.preventDefault();

    const tin = tinRegistryTin.trim().toUpperCase();
    const vatOwner = tinRegistryVatOwner.trim().toUpperCase();
    const nonVatOwner = tinRegistryNonVatOwner.trim().toUpperCase();
    const address = tinRegistryAddress.trim().toUpperCase();
    const savingFromRecordEntry = showTinRegisterModal;

    if (!tin) {
      alert('TIN is required.');
      return;
    }
    if (!vatOwner && !nonVatOwner) {
      alert('Please enter either VAT OWNER or NON VAT OWNER.');
      return;
    }
    if (vatOwner && nonVatOwner) {
      alert('Please enter only VAT OWNER or NON VAT OWNER.');
      return;
    }
    if (!address) {
      alert('ADDRESS is required.');
      return;
    }

    const duplicate = tinRegistry.some(
      (item) =>
        item.tin.trim().toUpperCase() === tin &&
        item.id !== editingTinRegistryId
    );
    if (duplicate) {
      alert('TIN already exists in TIN Registry.');
      return;
    }

    if (editingTinRegistryId) {
      setTinRegistry((current) =>
        current.map((item) =>
          item.id === editingTinRegistryId
            ? { ...item, tin, vatOwner, nonVatOwner, address }
            : item
        )
      );
      alert('TIN Registry record successfully updated!');
    } else {
      setTinRegistry((current) => [
        ...current,
        { id: Date.now().toString(), tin, vatOwner, nonVatOwner, address },
      ]);

      // When a new TIN is registered directly from Record Entry,
      // immediately apply the saved details to the current transaction.
      if (savingFromRecordEntry) {
        setTxTin(tin);
        setTxVatOwner(vatOwner);
        setTxNonVatOwner(nonVatOwner);
        setTxAddress(address);
      }

      alert('TIN successfully registered!');
    }

    resetTinRegistryForm();
    setShowTinRegisterForm(false);
    setShowTinRegisterModal(false);
  };

  const startEditTinRegistry = (item: TinRegistry) => {
    setEditingTinRegistryId(item.id);
    setTinRegistryTin(item.tin);
    setTinRegistryVatOwner(item.vatOwner);
    setTinRegistryNonVatOwner(item.nonVatOwner);
    setTinRegistryAddress(item.address);
    setShowTinRegisterForm(true);
  };

  const handleDeleteTinRegistry = (item: TinRegistry) => {
    if (!confirm(`Delete TIN Registry record "${item.tin}"?\n\nThis cannot be undone.`)) {
      return;
    }
    setTinRegistry((current) =>
      current.filter((record) => record.id !== item.id)
    );
    if (editingTinRegistryId === item.id) {
      resetTinRegistryForm();
      setShowTinRegisterForm(false);
    }
  };


  // ============================================================
  // EXPENSE ACCOUNTS
  // ============================================================

  const expenseAccounts = useMemo(
    () =>
      accounts.filter(
        (a) => a.type === 'Expense'
      ),
    [accounts]
  );

  // ============================================================
  // FINANCIAL STATEMENT SCOPE
  // Each financial statement is generated separately for the
  // selected transaction type: BIR ONLY, IN HOUSE ONLY, or
  // BIR & INHOUSE. This prevents cross-scope double counting.
  // ============================================================

  const [financialStatementScope, setFinancialStatementScope] =
    useState<TransactionScope>('BIR ONLY');

  // ============================================================
  // DATE FILTERED ENTRIES
  // ============================================================

  const filteredEntries = useMemo(() => {
    return [...entries]
      .filter((e) => {
        if (startDate && e.date < startDate) {
          return false;
        }

        if (endDate && e.date > endDate) {
          return false;
        }

        return true;
      })
      .sort((a, b) =>
        b.date.localeCompare(a.date)
      );
  }, [entries, startDate, endDate]);

  // ============================================================
  // IMPORTANT TRANSACTION ROUTING
  //
  // BIR ONLY:
  // - BIR Official Books
  // - BIR ONLY BOOKS
  // - BIR & INHOUSE BOOKS
  //
  // BIR & INHOUSE:
  // - BIR Official Books
  // - BIR ONLY BOOKS
  // - BIR & INHOUSE BOOKS
  //
  // IN HOUSE ONLY:
  // - IN HOUSE ONLY BOOKS
  // - BIR & INHOUSE BOOKS
  //
  // IN HOUSE ONLY NEVER GOES TO:
  // - Cash Receipts
  // - Cash Disbursements
  // - General Journal
  // - General Ledger
  // - BIR ONLY BOOKS
  // ============================================================

  // Official BIR Books
  const birEntries = useMemo(() => {
    return filteredEntries.filter(
      (e) =>
        e.transactionScope === 'BIR ONLY' ||
        e.transactionScope === 'BIR & INHOUSE'
    );
  }, [filteredEntries]);

  // BIR ONLY BOOKS
  //
  // IMPORTANT:
  // Despite the tab name, this book receives
  // BOTH BIR ONLY and BIR & INHOUSE.
  const birOnlyEntries = useMemo(() => {
    return filteredEntries.filter(
      (e) =>
        e.transactionScope === 'BIR ONLY' ||
        e.transactionScope === 'BIR & INHOUSE'
    );
  }, [filteredEntries]);

  // BIR & INHOUSE BOOKS
  //
  // IMPORTANT:
  // This book receives ALL THREE transaction scopes.
  const birInhouseEntries = useMemo(() => {
    return filteredEntries.filter(
      (e) =>
        e.transactionScope === 'BIR ONLY' ||
        e.transactionScope === 'BIR & INHOUSE' ||
        e.transactionScope === 'IN HOUSE ONLY'
    );
  }, [filteredEntries]);

  // IN HOUSE ONLY BOOKS
  //
  // ONLY IN HOUSE ONLY transactions.
  const inHouseOnlyEntries = useMemo(() => {
    return filteredEntries.filter(
      (e) =>
        e.transactionScope === 'IN HOUSE ONLY'
    );
  }, [filteredEntries]);

  // ============================================================
  // ACCOUNT TYPE MAP
  // ============================================================

  const accountTypeMap = useMemo(() => {
    const map = new Map<string, AccountType>();

    accounts.forEach((a) => {
      map.set(a.name, a.type);
    });

    return map;
  }, [accounts]);

  // ============================================================
  // ADD ACCOUNT
  // ============================================================

  const handleAddAccount = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!newAccountName.trim()) {
      return;
    }

    const nameUpper =
      newAccountName.trim().toUpperCase();

    if (
      accounts.some(
        (a) => a.name === nameUpper
      )
    ) {
      alert(
        'Account Title already exists!'
      );
      return;
    }

    setAccounts([
      ...accounts,
      {
        id: Date.now().toString(),
        name: nameUpper,
        type: newAccountType,
      },
    ]);

    setNewAccountName('');
  };

  const startEditAccount = (account: Account) => {
    setEditingAccountId(account.id);
    setEditingAccountName(account.name);
    setEditingAccountType(account.type);
  };

  const cancelEditAccount = () => {
    setEditingAccountId(null);
    setEditingAccountName('');
    setEditingAccountType('Expense');
  };

  const handleSaveAccountEdit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!editingAccountId) {
      return;
    }

    const nameUpper =
      editingAccountName.trim().toUpperCase();

    if (!nameUpper) {
      alert('Account Title is required.');
      return;
    }

    const duplicate = accounts.some(
      (a) =>
        a.id !== editingAccountId &&
        a.name === nameUpper
    );

    if (duplicate) {
      alert('Account Title already exists!');
      return;
    }

    const currentAccount = accounts.find(
      (a) => a.id === editingAccountId
    );

    if (!currentAccount) {
      alert('Account not found.');
      cancelEditAccount();
      return;
    }

    const oldName = currentAccount.name;

    setAccounts((currentAccounts) =>
      currentAccounts.map((account) =>
        account.id === editingAccountId
          ? {
              ...account,
              name: nameUpper,
              type: editingAccountType,
            }
          : account
      )
    );

    // Preserve existing transaction links when an account title changes.
    if (oldName !== nameUpper) {
      setEntries((currentEntries) =>
        currentEntries.map((entry) => ({
          ...entry,
          debitAccount:
            entry.debitAccount === oldName
              ? nameUpper
              : entry.debitAccount,
          creditAccount:
            entry.creditAccount === oldName
              ? nameUpper
              : entry.creditAccount,
        }))
      );
    }

    cancelEditAccount();
    alert('Account successfully updated!');
  };

  const handleDeleteAccount = (account: Account) => {
    const usedInTransactions = entries.some(
      (entry) =>
        entry.debitAccount === account.name ||
        entry.creditAccount === account.name
    );

    if (usedInTransactions) {
      alert(
        `Cannot delete ${account.name}. This account is already used in existing transactions. Edit or remove those transaction references first.`
      );
      return;
    }

    if (
      !confirm(
        `Delete account "${account.name}"?\n\nThis cannot be undone.`
      )
    ) {
      return;
    }

    setAccounts((currentAccounts) =>
      currentAccounts.filter(
        (item) => item.id !== account.id
      )
    );

    if (editingAccountId === account.id) {
      cancelEditAccount();
    }
  };

  const moveAccount = (
    accountId: string,
    direction: 'up' | 'down'
  ) => {
    setAccounts((currentAccounts) => {
      const currentIndex =
        currentAccounts.findIndex(
          (account) => account.id === accountId
        );

      if (currentIndex === -1) {
        return currentAccounts;
      }

      const targetIndex =
        direction === 'up'
          ? currentIndex - 1
          : currentIndex + 1;

      if (
        targetIndex < 0 ||
        targetIndex >= currentAccounts.length
      ) {
        return currentAccounts;
      }

      const reordered = [...currentAccounts];
      const [movedAccount] = reordered.splice(
        currentIndex,
        1
      );
      reordered.splice(
        targetIndex,
        0,
        movedAccount
      );

      return reordered;
    });
  };

  // ============================================================
  // ADD TRANSACTION
  // ============================================================

  const handleAddTransaction = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const amountNum =
      parseFloat(txAmount);

    if (
      isNaN(amountNum) ||
      amountNum <= 0
    ) {
      alert(
        'Please enter a valid amount.'
      );
      return;
    }

    if (txDebitAcc === txCreditAcc) {
      alert(
        'Debit and Credit accounts must be different!'
      );
      return;
    }

    const formattedDate =
      `${txYear}-${txMonth}-${String(
        txDay
      ).padStart(2, '0')}`;

    const newEntry: DoubleEntry = {
      id: Date.now().toString(),
      date: formattedDate,
      particulars:
        txParticulars
          .trim()
          .toUpperCase(),
      refNo:
        txRefNo
          .trim()
          .toUpperCase(),
      tin:
        txTin
          .trim()
          .toUpperCase(),
      vatOwner:
        txVatOwner
          .trim()
          .toUpperCase(),
      nonVatOwner:
        txNonVatOwner
          .trim()
          .toUpperCase(),
      address:
        txAddress
          .trim()
          .toUpperCase(),
      transactionScope: txScope,
      debitAccount: txDebitAcc,
      creditAccount: txCreditAcc,
      amount: amountNum,
      grossAmount: amountNum,
      vatExclusive: hasVatOwner ? vatExclusiveAmount : undefined,
      vatAmount: hasVatOwner ? vatAmount : undefined,
      isVoided: false,
    };

    setEntries([
      newEntry,
      ...entries,
    ]);

    setTxParticulars('');
    setTxRefNo('');
    setTxTin('');
    setTxVatOwner('');
    setTxNonVatOwner('');
    setTxAddress('');
    setTxAmount('');

    alert(
      'Transaction successfully posted!'
    );
  };

  // ============================================================
  // VOID / UNVOID
  // ============================================================

  const handleToggleVoid = (
    id: string
  ) => {
    if (
      confirm(
        'Are you sure you want to change the Void status of this entry?'
      )
    ) {
      setEntries(
        entries.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                isVoided:
                  !entry.isVoided,
              }
            : entry
        )
      );
    }
  };

  // ============================================================
  // CSV EXPORT
  // ============================================================

  const exportToCSV = (
    filename: string,
    rows: Record<string, any>[]
  ) => {
    if (!rows.length) {
      alert(
        'No data available to export!'
      );
      return;
    }

    const headers =
      Object.keys(rows[0]).join(',');

    const csvContent = [
      headers,
      ...rows.map((row) =>
        Object.values(row)
          .map(
            (val) =>
              `"${String(val).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob(
      [csvContent],
      {
        type: 'text/csv;charset=utf-8;',
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.setAttribute(
      'href',
      url
    );

    link.setAttribute(
      'download',
      `${filename}.csv`
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ============================================================
  // GENERAL LEDGER - ACCOUNT CSV EXPORT
  // ============================================================
  //
  // Exports ONLY the selected account from the General Ledger.
  // Uses the same BIR General Ledger source:
  // BIR ONLY + BIR & INHOUSE.
  //
  // The date filter currently active on the screen is also
  // respected because birEntries comes from filteredEntries.
  // ============================================================

  const exportGeneralLedgerAccountCSV = (
    account: Account
  ) => {
    const accountEntries =
      birEntries.filter(
        (e) =>
          e.debitAccount === account.name ||
          e.creditAccount === account.name
      );

    if (!accountEntries.length) {
      alert(
        `No General Ledger transactions available for ${account.name}.`
      );
      return;
    }

    const rows =
      accountEntries.map(
        (e) => {
          const isDebit =
            e.debitAccount ===
            account.name;

          return {
            Date: e.date,
            Particulars:
              e.particulars,
            RefNo:
              e.refNo,
            Scope:
              e.transactionScope,
            Account:
              account.name,
            Debit:
              isDebit
                ? e.amount
                : '',
            Credit:
              !isDebit
                ? e.amount
                : '',
            Status:
              e.isVoided
                ? 'VOIDED'
                : 'VALID',
          };
        }
      );

    const safeAccountName =
      account.name
        .replace(
          /[^a-zA-Z0-9]+/g,
          '_'
        )
        .replace(
          /^_+|_+$/g,
          ''
        );

    exportToCSV(
      `General_Ledger_${safeAccountName}`,
      rows
    );
  };

  // ============================================================
  // SCOPE BOOK COMPONENT
  // ============================================================

  const renderScopeBook = (
    title: string,
    subtitle: string,
    scopeEntries: DoubleEntry[],
    filename: string,
    theme:
      | 'indigo'
      | 'amber'
      | 'slate'
  ) => {
    const validEntries =
      scopeEntries.filter(
        (e) => !e.isVoided
      );

    const sales =
      validEntries
        .filter(
          (e) =>
            e.creditAccount ===
              'SALES INCOME' ||
            accountTypeMap.get(
              e.creditAccount
            ) === 'Income'
        )
        .reduce(
          (sum, e) =>
            sum + e.amount,
          0
        );

    const expenses =
      validEntries
        .filter(
          (e) =>
            accountTypeMap.get(
              e.debitAccount
            ) === 'Expense'
        )
        .reduce(
          (sum, e) =>
            sum + e.amount,
          0
        );

    const net =
      sales - expenses;

    const themeClasses =
      theme === 'indigo'
        ? {
            outer:
              'border-indigo-200 bg-indigo-50/30',
            header:
              'bg-indigo-950',
            badge:
              'bg-indigo-100 text-indigo-800 border-indigo-200',
            table:
              'bg-indigo-50/50 text-indigo-950',
          }
        : theme === 'amber'
        ? {
            outer:
              'border-amber-200 bg-amber-50/30',
            header:
              'bg-amber-950',
            badge:
              'bg-amber-100 text-amber-800 border-amber-200',
            table:
              'bg-amber-50/50 text-amber-950',
          }
        : {
            outer:
              'border-slate-200 bg-slate-50/40',
            header:
              'bg-slate-900',
            badge:
              'bg-slate-100 text-slate-800 border-slate-200',
            table:
              'bg-slate-100',
          };

    return (
      <div className="space-y-6">

        {/* DASHBOARD */}

        <div
          className={`border p-6 rounded-2xl shadow-sm ${themeClasses.outer}`}
        >
          <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {title}
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                {subtitle}
              </p>
            </div>

            <span
              className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${themeClasses.badge}`}
            >
              {scopeEntries.length}{' '}
              Records
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Transactions
              </span>

              <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                {scopeEntries.length}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Revenue
              </span>

              <div className="text-xl font-black text-emerald-600 font-mono mt-1">
                {formatAmount(sales)}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Expenses
              </span>

              <div className="text-xl font-black text-rose-600 font-mono mt-1">
                {formatAmount(expenses)}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Net
              </span>

              <div
                className={`text-xl font-black font-mono mt-1 ${
                  net >= 0
                    ? 'text-indigo-900'
                    : 'text-rose-700'
                }`}
              >
                {formatAmount(net)}
              </div>
            </div>

          </div>
        </div>

        {/* JOURNAL TABLE */}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">

          <div className="flex flex-wrap justify-between items-center gap-3 mb-5">

            <div>
              <h2 className="text-base font-bold text-slate-900">
                {title} — Journal
              </h2>

              <p className="text-xs text-slate-500">
                Transactions included according to the book routing rules.
              </p>
            </div>

            <button
              onClick={() =>
                exportToCSV(
                  filename,
                  scopeEntries.map(
                    (e) => ({
                      Date: e.date,
                      Particulars:
                        e.particulars,
                      RefNo: e.refNo,
                      TransactionScope:
                        e.transactionScope,
                      DebitAccount:
                        e.debitAccount,
                      CreditAccount:
                        e.creditAccount,
                      Amount: e.amount,
                      Status:
                        e.isVoided
                          ? 'VOIDED'
                          : 'VALID',
                    })
                  )
                )
              }
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 py-2 rounded-lg font-bold transition"
            >
              📥 Export CSV
            </button>
          </div>

          <table className="w-full text-left border-collapse text-xs">

            <thead>
              <tr
                className={`${themeClasses.table} border-b border-slate-200 font-bold uppercase tracking-wider`}
              >
                <th className="p-3 border border-slate-200">
                  Date
                </th>

                <th className="p-3 border border-slate-200">
                  Particulars
                </th>

                <th className="p-3 border border-slate-200">
                  Ref #
                </th>

                <th className="p-3 border border-slate-200">
                  Scope
                </th>

                <th className="p-3 border border-slate-200">
                  Debit Account
                </th>

                <th className="p-3 border border-slate-200">
                  Credit Account
                </th>

                <th className="p-3 border border-slate-200 text-right">
                  Amount
                </th>

                <th className="p-3 border border-slate-200 text-center">
                  Status
                </th>

                <th className="p-3 border border-slate-200 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {scopeEntries.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="p-8 text-center text-slate-400 font-medium"
                  >
                    No transactions recorded under this book.
                  </td>
                </tr>
              ) : (
                scopeEntries.map(
                  (e) => (
                    <tr
                      key={e.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition ${
                        e.isVoided
                          ? 'bg-rose-50 text-rose-500 line-through'
                          : ''
                      }`}
                    >
                      <td className="p-3 border border-slate-200 font-mono text-[11px]">
                        {e.date}
                      </td>

                      <td className="p-3 border border-slate-200 font-semibold">
                        {e.particulars}
                      </td>

                      <td className="p-3 border border-slate-200 font-mono">
                        {e.refNo}
                      </td>

                      <td className="p-3 border border-slate-200 font-bold text-indigo-600">
                        {e.transactionScope}
                      </td>

                      <td className="p-3 border border-slate-200 font-bold text-indigo-900">
                        {e.debitAccount}
                      </td>

                      <td className="p-3 border border-slate-200 font-bold text-emerald-900">
                        {e.creditAccount}
                      </td>

                      <td className="p-3 border border-slate-200 text-right font-mono font-black">
                        {formatAmount(
                          e.amount
                        )}
                      </td>

                      <td className="p-3 border border-slate-200 text-center">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-black ${
                            e.isVoided
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {e.isVoided
                            ? 'VOIDED'
                            : 'VALID'}
                        </span>
                      </td>

                      <td className="p-3 border border-slate-200 text-center">
                        <button
                          onClick={() =>
                            handleToggleVoid(
                              e.id
                            )
                          }
                          className={`text-[11px] px-2.5 py-1 rounded font-bold ${
                            e.isVoided
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          }`}
                        >
                          {e.isVoided
                            ? 'Unvoid'
                            : 'Void'}
                        </button>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>

          </table>
        </div>

        {/* ACCOUNT BREAKDOWN */}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">

          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              Account Breakdown
            </h2>

            <p className="text-xs text-slate-500">
              Balances for this book only.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {accounts.map(
              (acc) => {
                const activeValidEntries =
                  scopeEntries.filter(
                    (e) =>
                      !e.isVoided
                  );

                const debitEntries =
                  activeValidEntries.filter(
                    (e) =>
                      e.debitAccount ===
                      acc.name
                  );

                const creditEntries =
                  activeValidEntries.filter(
                    (e) =>
                      e.creditAccount ===
                      acc.name
                  );

                const totalDebit =
                  debitEntries.reduce(
                    (sum, e) =>
                      sum + e.amount,
                    0
                  );

                const totalCredit =
                  creditEntries.reduce(
                    (sum, e) =>
                      sum + e.amount,
                    0
                  );

                const netBalance =
                  totalDebit -
                  totalCredit;

                return (
                  <div
                    key={acc.id}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white"
                  >
                    <div className="bg-slate-900 text-white p-4">

                      <div className="flex justify-between items-center">

                        <h3 className="font-extrabold text-xs uppercase tracking-wider">
                          {acc.name}
                        </h3>

                        <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-300 font-bold">
                          {acc.type}
                        </span>

                      </div>

                      <div className="grid grid-cols-3 text-[11px] mt-3 pt-2.5 border-t border-slate-800 text-slate-300 font-mono">

                        <div>
                          DR:{' '}
                          <b className="text-white">
                            {formatAmount(
                              totalDebit
                            )}
                          </b>
                        </div>

                        <div>
                          CR:{' '}
                          <b className="text-white">
                            {formatAmount(
                              totalCredit
                            )}
                          </b>
                        </div>

                        <div>
                          NET:{' '}
                          <b className="text-indigo-400">
                            {formatAmount(
                              Math.abs(
                                netBalance
                              )
                            )}
                          </b>
                        </div>

                      </div>
                    </div>

                    <div className="p-2 overflow-x-auto">

                      <table className="w-full text-xs text-left border-collapse">

                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">

                            <th className="p-2 border border-slate-200">
                              Date
                            </th>

                            <th className="p-2 border border-slate-200">
                              Particulars
                            </th>

                            <th className="p-2 border border-slate-200 text-right">
                              Debit
                            </th>

                            <th className="p-2 border border-slate-200 text-right">
                              Credit
                            </th>

                          </tr>
                        </thead>

                        <tbody>

                          {scopeEntries
                            .filter(
                              (e) =>
                                e.debitAccount ===
                                  acc.name ||
                                e.creditAccount ===
                                  acc.name
                            )
                            .map(
                              (e) => {
                                const isDebit =
                                  e.debitAccount ===
                                  acc.name;

                                return (
                                  <tr
                                    key={e.id}
                                    className={`border-b border-slate-100 ${
                                      e.isVoided
                                        ? 'bg-rose-50 text-rose-400 line-through'
                                        : ''
                                    }`}
                                  >

                                    <td className="p-2 border border-slate-200 font-mono text-[11px]">
                                      {e.date}
                                    </td>

                                    <td className="p-1.5 border border-slate-200 font-medium">
                                      {e.particulars}
                                    </td>

                                    <td className="p-2 border border-slate-200 text-right font-mono font-bold text-indigo-700">
                                      {isDebit
                                        ? formatAmount(
                                            e.amount
                                          )
                                        : '-'}
                                    </td>

                                    <td className="p-2 border border-slate-200 text-right font-mono font-bold text-emerald-700">
                                      {!isDebit
                                        ? formatAmount(
                                            e.amount
                                          )
                                        : '-'}
                                    </td>

                                  </tr>
                                );
                              }
                            )}

                        </tbody>

                      </table>

                    </div>
                  </div>
                );
              }
            )}

          </div>
        </div>

      </div>
    );
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === 'admin' && password === '1234') {
      setIsLoggedIn(true);
      setPassword('');
    } else {
      alert('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-400 text-sm font-medium">
        Loading Accounting Engine...
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl mb-4">📊</div>
            <h1 className="text-2xl font-black text-slate-900">BIR Automated Books</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to continue</p>
          </div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-3 mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-3 mb-6 outline-none focus:ring-2 focus:ring-indigo-500"
            autoComplete="current-password"
          />
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold">
            LOG IN
          </button>
          <p className="text-center text-xs text-slate-400 mt-5">Username: admin &nbsp; Password: 1234</p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-4 sm:p-8 font-sans antialiased">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <header className="mb-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap justify-between items-center gap-4">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/30">
            📊
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Ledger Suite
            </h1>

            <p className="text-xs text-slate-500">
              Double-Entry Accounting System • Compliance Scope Manager
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2">

          <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">

            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>

            System Live

          </span>

          <button
            type="button"
            onClick={handleLogout}
            className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg"
          >
            LOG OUT
          </button>

        </div>

      </header>

      {showTinRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-black text-slate-900">REGISTER TIN</h2>
                <p className="text-xs text-slate-500 mt-1">Save this TIN directly to the TIN Registry.</p>
              </div>
              <button type="button" onClick={() => { resetTinRegistryForm(); setShowTinRegisterModal(false); }} className="text-slate-500 hover:text-slate-900 font-bold">✕</button>
            </div>
            <form onSubmit={handleSaveTinRegistry}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" placeholder="TIN" value={tinRegistryTin} onChange={(e) => setTinRegistryTin(e.target.value)} className="border border-slate-300 rounded-lg p-2.5 text-xs uppercase bg-white outline-hidden focus:ring-2 focus:ring-indigo-500" required />
                <input type="text" placeholder="VAT OWNER" value={tinRegistryVatOwner} onChange={(e) => { setTinRegistryVatOwner(e.target.value); if (e.target.value.trim()) setTinRegistryNonVatOwner(''); }} className="border border-slate-300 rounded-lg p-2.5 text-xs uppercase bg-white outline-hidden focus:ring-2 focus:ring-indigo-500" />
                <input type="text" placeholder="NON VAT OWNER" value={tinRegistryNonVatOwner} onChange={(e) => { setTinRegistryNonVatOwner(e.target.value); if (e.target.value.trim()) setTinRegistryVatOwner(''); }} className="border border-slate-300 rounded-lg p-2.5 text-xs uppercase bg-white outline-hidden focus:ring-2 focus:ring-indigo-500" />
                <input type="text" placeholder="ADDRESS" value={tinRegistryAddress} onChange={(e) => setTinRegistryAddress(e.target.value)} className="border border-slate-300 rounded-lg p-2.5 text-xs uppercase bg-white outline-hidden focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold">SAVE TO TIN REGISTRY</button>
                <button type="button" onClick={() => { resetTinRegistryForm(); setShowTinRegisterModal(false); }} className="border border-slate-300 bg-white px-4 py-2.5 rounded-lg text-xs font-bold text-slate-700">CANCEL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DATE FILTER
      ======================================================== */}

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4">

        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">

          <span className="text-slate-800 uppercase tracking-wider font-bold">
            Filter Range:
          </span>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">

            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(
                  e.target.value
                )
              }
              className="bg-transparent text-xs text-slate-800 font-semibold outline-hidden cursor-pointer"
            />

            <span className="text-slate-400 font-normal">
              to
            </span>

            <input
              type="date"
              value={endDate}
              onChange={(e) =>
                setEndDate(
                  e.target.value
                )
              }
              className="bg-transparent text-xs text-slate-800 font-semibold outline-hidden cursor-pointer"
            />

          </div>

          {(startDate ||
            endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline"
            >
              Clear
            </button>
          )}

        </div>

        <div className="text-xs font-semibold text-slate-500">

          Showing{' '}

          <span className="text-slate-900 font-bold">
            {filteredEntries.length}
          </span>{' '}

          of{' '}

          <span className="text-slate-900 font-bold">
            {entries.length}
          </span>{' '}

          records

        </div>

      </div>

      {/* ========================================================
          NAVIGATION
      ======================================================== */}

      <div className="flex flex-wrap gap-1.5 mb-6 bg-slate-200/60 p-1.5 rounded-xl border border-slate-200/80">

        {[
          {
            id: 'entry',
            label: '➕ Record Entry',
          },
                    {
            id: 'tinRegistry',
            label: '🧾 TIN Registry',
          },
          {
            id: 'receipts',
            label: 'Cash Receipts',
          },
          {
            id: 'disbursements',
            label: 'Cash Disbursements',
          },
          {
            id: 'journal',
            label: 'General Journal',
          },
          {
            id: 'ledger',
            label: 'General Ledger',
          },
          {
            id: 'birOnlyBooks',
            label: '📘 BIR ONLY BOOKS',
          },
          {
            id: 'birInhouseBooks',
            label: '📗 BIR & INHOUSE',
          },
          {
            id: 'inhouse',
            label: '🏠 IN-HOUSE ONLY',
          },
          {
            id: 'reports',
            label: '📊 Financial Statement',
          },
          {
            id: 'settings',
            label: '⚙️ Chart of Accounts',
          },

        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() =>
              setActiveTab(
                tab.id as any
              )
            }
            className={`px-4 py-2 text-xs font-bold transition-all rounded-lg ${
              activeTab === tab.id
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            {tab.label}
          </button>
        ))}

      </div>

      {/* ========================================================
          1. MASTER ENTRY
      ======================================================== */}

      {activeTab === 'entry' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 max-w-4xl mx-auto overflow-hidden">

          <div className="px-6 py-1 bg-slate-900 text-white flex justify-between items-center">

            <div>
              <h2 className="text-base font-bold tracking-tight">
                Record Double-Entry Transaction
              </h2>

              <p className="text-[11px] text-slate-400">
                Fill in transaction parameters and posting details.
              </p>
            </div>

            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-md font-mono">
              STATUS: READY
            </span>

          </div>

          <form
            onSubmit={
              handleAddTransaction
            }
            className="p-6 space-y-2"
          >

            {/* DATE + SCOPE */}

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">

              {/* DATE */}

              <div className="flex items-center gap-3 shrink-0">

                <div className="flex items-center gap-1.5">

                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>

                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Transaction Date
                  </span>

                </div>

                <div className="flex items-center gap-1.5">

                  <select
                    value={txMonth}
                    onChange={(e) =>
                      setTxMonth(
                        e.target.value
                      )
                    }
                    className="border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden shadow-2xs"
                  >
                    {MONTHS.map(
                      (m) => (
                        <option
                          key={
                            m.value
                          }
                          value={
                            m.value
                          }
                        >
                          {m.label}
                        </option>
                      )
                    )}
                  </select>

                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="DD"
                    value={txDay}
                    onChange={(e) =>
                      setTxDay(
                        e.target.value
                      )
                    }
                    className="w-14 border border-slate-300 rounded-lg py-2 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden text-center shadow-2xs"
                    required
                  />

                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    placeholder="YYYY"
                    value={txYear}
                    onChange={(e) =>
                      setTxYear(
                        e.target.value
                      )
                    }
                    className="w-20 border border-slate-300 rounded-lg py-2 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden text-center shadow-2xs"
                    required
                  />

                </div>

              </div>

              <div className="hidden lg:block w-px h-10 bg-slate-300"></div>

              {/* SCOPE */}

              <div className="flex items-center gap-3 grow">

                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap shrink-0">
                  Transaction Type
                </span>

                <div className="grid grid-cols-3 gap-0.5 bg-slate-200/70 p-.01 rounded-xl grow">

                  {[
                    {
                      id: 'BIR & INHOUSE',
                      title: 'BIR & INHOUSE',
                      sub: 'Both Books',
                    },
                    {
                      id: 'BIR ONLY',
                      title: 'BIR ONLY',
                      sub: 'Official Books',
                    },
                    {
                      id: 'IN HOUSE ONLY',
                      title: 'IN HOUSE ONLY',
                      sub: 'Internal Books',
                    },
                  ].map(
                    (scope) => {
                      const isSelected =
                        txScope ===
                        scope.id;

                      return (
                        <button
                          key={
                            scope.id
                          }
                          type="button"
                          onClick={() =>
                            setTxScope(
                              scope.id as TransactionScope
                            )
                          }
                          className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm font-bold'
                              : 'bg-transparent text-slate-600 hover:text-slate-900 font-semibold'
                          }`}
                        >

                          <div className="text-[11px] leading-tight">
                            {
                              scope.title
                            }
                          </div>

                          <div
                            className={`text-[9px] ${
                              isSelected
                                ? 'text-indigo-100'
                                : 'text-slate-400'
                            }`}
                          >
                            {
                              scope.sub
                            }
                          </div>

                        </button>
                      );
                    }
                  )}

                </div>

              </div>

            </div>

            {/* DEBIT / CREDIT */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100">

                <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">
                  Debit Account (DR)
                </label>

                <select
                  value={
                    txDebitAcc
                  }
                  onChange={(e) => {
                    const selectedAccount = e.target.value;
                    setTxDebitAcc(selectedAccount);

                    const selectedType =
                      accountTypeMap.get(selectedAccount);

                    if (selectedType === 'Expense') {
                      setTxCreditAcc('CASH ON HAND');
                    }
                  }}
                  className="w-full border border-indigo-200 rounded-lg p-2.5 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden shadow-2xs"
                >
                  {accounts.map(
                    (acc) => (
                      <option
                        key={
                          acc.id
                        }
                        value={
                          acc.name
                        }
                      >
                        DR:{' '}
                        {
                          acc.name
                        }{' '}
                        (
                        {
                          acc.type
                        }
                        )
                      </option>
                    )
                  )}
                </select>

              </div>

              <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100">

                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
                  Credit Account (CR)
                </label>

                <select
                  value={
                    txCreditAcc
                  }
                  onChange={(e) => {
                    const selectedAccount = e.target.value;
                    setTxCreditAcc(selectedAccount);

                    if (selectedAccount === 'SALES INCOME') {
                      setTxDebitAcc('CASH ON HAND');
                    }
                  }}
                  className="w-full border border-emerald-200 rounded-lg p-2.5 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden shadow-2xs"
                >
                  {accounts.map(
                    (acc) => (
                      <option
                        key={
                          acc.id
                        }
                        value={
                          acc.name
                        }
                      >
                        CR:{' '}
                        {
                          acc.name
                        }{' '}
                        (
                        {
                          acc.type
                        }
                        )
                      </option>
                    )
                  )}
                </select>

              </div>

            </div>

            {/* TIN / OWNER DETAILS */}

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  TIN
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ENTER TIN"
                    value={txTin}
                    onChange={(e) => handleTinChange(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs uppercase bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden shadow-2xs"
                  />

                  {txTin.trim() && !tinRegistryMatch && tinSuggestions.length > 0 && (
                    <div className="absolute z-40 left-0 right-0 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                      <div className="px-3 py-2 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        TIN SUGGESTIONS
                      </div>

                      {tinSuggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          tabIndex={-1}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectTinSuggestion(item)}
                          className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 border-b last:border-b-0 border-slate-100"
                        >
                          <div className="text-xs font-black font-mono text-slate-900">
                            {item.tin}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                            {item.vatOwner || item.nonVatOwner} • {item.address}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 -mt-2">
                {txTin.trim() && tinRegistryMatch ? (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800 font-bold">
                    TIN FOUND — {tinRegistryMatch.vatOwner || tinRegistryMatch.nonVatOwner} — {tinRegistryMatch.address}
                  </div>
                ) : txTin.trim() && tinSuggestions.length === 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800 font-bold flex flex-wrap items-center justify-between gap-2">
                    <span>TIN not found in Registry</span>
                    <button
                      type="button"
                      onClick={() => {
                        resetTinRegistryForm();
                        setTinRegistryTin(txTin.trim().toUpperCase());
                        setShowTinRegisterModal(true);
                        setShowTinRegisterForm(false);
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-md text-[10px] font-bold"
                    >
                      + REGISTER TIN
                    </button>
                  </div>
                ) : txTin.trim() && tinSuggestions.length > 0 ? (
                  <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-[11px] text-indigo-800 font-bold">
                    Select a TIN suggestion above to automatically fill the owner and address.
                  </div>
                ) : null}
              </div>

            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                DESCRIPTION
              </label>
              <input
                type="text"
                placeholder="ENTER COMPLETE TRANSACTION DESCRIPTION"
                value={txParticulars}
                onChange={(e) => setTxParticulars(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs uppercase bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden shadow-2xs"
                required
              />
            </div>

            {/* SI / REF / VOUCHER + AMOUNT */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  SI / REF / VOUCHER
                </label>
                <input
                  type="text"
                  placeholder="ENTER SI / REF / VOUCHER"
                  value={txRefNo}
                  onChange={(e) => setTxRefNo(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs uppercase bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  GROSS AMOUNT
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-black text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  VAT EXCLUSIVE
                </label>
                <input
                  type="text"
                  value={hasVatOwner && grossAmountNum > 0 ? vatExclusiveAmount.toFixed(2) : ''}
                  readOnly
                  tabIndex={-1}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-black text-slate-900 bg-slate-50 outline-hidden shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  VAT AMOUNT
                </label>
                <input
                  type="text"
                  value={hasVatOwner && grossAmountNum > 0 ? vatAmount.toFixed(2) : ''}
                  readOnly
                  tabIndex={-1}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-black text-slate-900 bg-slate-50 outline-hidden shadow-2xs"
                />
              </div>

            </div>

            {/* POST */}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20 active:scale-[0.99]"
            >
              Post Transaction To Ledger
            </button>

          </form>
        </div>
      )}

      {/* ========================================================
          2. BIR CASH RECEIPTS
          ONLY BIR ONLY + BIR & INHOUSE
      ======================================================== */}

      {activeTab === 'receipts' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">

          <div className="flex justify-between items-center mb-5">

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Cash Receipts Journal (Official Books)
              </h2>

              <p className="text-xs text-slate-500">
                ONLY BIR ONLY & BIR & INHOUSE transactions
              </p>
            </div>

            <button
              onClick={() =>
                exportToCSV(
                  'BIR_Cash_Receipts_Journal',
                  birEntries
                    .filter(
                      (e) =>
                        accountTypeMap.get(
                          e.creditAccount
                        ) === 'Income' ||
                        e.creditAccount.includes(
                          'SALES'
                        )
                    )
                    .map(
                      (e) => ({
                        Date: e.date,
                        Particulars:
                          e.particulars,
                        RefNo: e.refNo,
                        Scope:
                          e.transactionScope,
                        Debit_Cash:
                          e.amount,
                        Credit_Sales:
                          e.amount,
                        Status:
                          e.isVoided
                            ? 'VOIDED'
                            : 'VALID',
                      })
                    )
                )
              }
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 py-2 rounded-lg font-bold transition"
            >
              📥 Export CSV
            </button>

          </div>

          <table className="w-full text-left border-collapse text-xs">

            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">

                <th className="p-3 border border-slate-200">
                  Date
                </th>

                <th className="p-3 border border-slate-200">
                  Particulars
                </th>

                <th className="p-3 border border-slate-200">
                  Ref #
                </th>

                <th className="p-3 border border-slate-200">
                  Scope
                </th>

                <th className="p-3 border border-slate-200 text-right">
                  Debit (Cash)
                </th>

                <th className="p-3 border border-slate-200 text-right">
                  Credit (Sales)
                </th>

                <th className="p-3 border border-slate-200 text-center">
                  Action
                </th>

              </tr>
            </thead>

            <tbody>

              {birEntries
                .filter(
                  (e) =>
                    accountTypeMap.get(
                      e.creditAccount
                    ) === 'Income' ||
                    e.creditAccount.includes(
                      'SALES'
                    )
                )
                .map(
                  (e) => (
                    <tr
                      key={e.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition ${
                        e.isVoided
                          ? 'bg-rose-50 text-rose-500 line-through'
                          : ''
                      }`}
                    >

                      <td className="p-3 border border-slate-200 font-mono text-[11px]">
                        {e.date}
                      </td>

                      <td className="p-3 border border-slate-200 font-semibold">
                        {e.particulars}
                      </td>

                      <td className="p-3 border border-slate-200 font-mono">
                        {e.refNo}
                      </td>

                      <td className="p-3 border border-slate-200 font-bold text-indigo-600">
                        {e.transactionScope}
                      </td>

                      <td className="p-3 border border-slate-200 text-right font-mono font-bold">
                        {formatAmount(
                          e.amount
                        )}
                      </td>

                      <td className="p-3 border border-slate-200 text-right font-mono font-bold">
                        {formatAmount(
                          e.amount
                        )}
                      </td>

                      <td className="p-3 border border-slate-200 text-center">

                        <button
                          onClick={() =>
                            handleToggleVoid(
                              e.id
                            )
                          }
                          className={`text-[11px] px-2.5 py-1 rounded font-bold ${
                            e.isVoided
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          }`}
                        >
                          {e.isVoided
                            ? 'Unvoid'
                            : 'Void'}
                        </button>

                      </td>

                    </tr>
                  )
                )}

            </tbody>

          </table>

        </div>
      )}

      {/* ========================================================
          3. BIR CASH DISBURSEMENTS
          ONLY BIR ONLY + BIR & INHOUSE
      ======================================================== */}

      {activeTab === 'disbursements' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">

          <div className="flex justify-between items-center mb-5">

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Cash Disbursements Journal (Official Books)
              </h2>

              <p className="text-xs text-slate-500">
                ONLY BIR ONLY & BIR & INHOUSE transactions
              </p>
            </div>

            <button
              onClick={() =>
                exportToCSV(
                  'BIR_Cash_Disbursements_Journal',
                  birEntries
                    .filter(
                      (e) =>
                        accountTypeMap.get(
                          e.debitAccount
                        ) === 'Expense'
                    )
                    .map(
                      (e) => {
                        const row: Record<
                          string,
                          any
                        > = {
                          Date: e.date,
                          TIN: e.tin || '',
                          VATOwner: e.vatOwner || '',
                          NonVATOwner: e.nonVatOwner || '',
                          Address: e.address || '',
                          Description: e.particulars,
                          SI_Ref_Voucher: e.refNo,
                          Scope: e.transactionScope,
                          Amount: e.amount,
                          Status:
                            e.isVoided
                              ? 'VOIDED'
                              : 'VALID',
                        };

                        expenseAccounts.forEach(
                          (acc) => {
                            row[
                              acc.name
                            ] =
                              e.debitAccount ===
                              acc.name
                                ? e.amount
                                : 0;
                          }
                        );

                        return row;
                      }
                    )
                )
              }
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 py-2 rounded-lg font-bold transition"
            >
              📥 Export CSV
            </button>

          </div>

          <table className="w-full text-left border-collapse text-xs">

            <thead>

              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">

                <th className="p-2.5 border border-slate-200 min-w-[80px]">
                  Date
                </th>

                <th className="p-2.5 border border-slate-200 min-w-[110px]">
                  TIN
                </th>

                <th className="p-2.5 border border-slate-200 min-w-[120px]">
                  VAT OWNER
                </th>

                <th className="p-2.5 border border-slate-200 min-w-[130px]">
                  NON VAT OWNER
                </th>

                <th className="p-2.5 border border-slate-200 min-w-[180px]">
                  ADDRESS
                </th>

                <th className="p-2.5 border border-slate-200 min-w-[180px]">
                  DESCRIPTION
                </th>

                <th className="p-2.5 border border-slate-200 min-w-[120px]">
                  SI / REF / VOUCHER
                </th>

                <th className="p-2.5 border border-slate-200 min-w-[90px]">
                  Scope
                </th>

                {expenseAccounts.map(
                  (acc) => (
                    <th
                      key={acc.id}
                      className="p-2.5 border border-slate-200 text-right min-w-[110px] bg-amber-50/50"
                    >
                      {acc.name}
                    </th>
                  )
                )}

                <th className="p-2.5 border border-slate-200 text-center">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {birEntries
                .filter(
                  (e) =>
                    accountTypeMap.get(
                      e.debitAccount
                    ) === 'Expense'
                )
                .map(
                  (e) => (
                    <tr
                      key={e.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition ${
                        e.isVoided
                          ? 'bg-rose-50 text-rose-500 line-through'
                          : ''
                      }`}
                    >

                      <td className="p-2.5 border border-slate-200 font-mono text-[11px]">
                        {e.date}
                      </td>

                      <td className="p-2.5 border border-slate-200 font-mono">
                        {e.tin || '-'}
                      </td>

                      <td className="p-2.5 border border-slate-200 font-semibold">
                        {e.vatOwner || '-'}
                      </td>

                      <td className="p-2.5 border border-slate-200 font-semibold">
                        {e.nonVatOwner || '-'}
                      </td>

                      <td className="p-2.5 border border-slate-200">
                        {e.address || '-'}
                      </td>

                      <td className="p-2.5 border border-slate-200 font-semibold">
                        {e.particulars}
                      </td>

                      <td className="p-2.5 border border-slate-200 font-mono">
                        {e.refNo}
                      </td>

                      <td className="p-2.5 border border-slate-200 font-bold text-indigo-600">
                        {e.transactionScope}
                      </td>

                      {expenseAccounts.map(
                        (acc) => (
                          <td
                            key={acc.id}
                            className="p-2.5 border border-slate-200 text-right font-mono font-bold"
                          >
                            {e.debitAccount ===
                            acc.name
                              ? formatAmount(
                                  e.amount
                                )
                              : '-'}
                          </td>
                        )
                      )}

                      <td className="p-2.5 border border-slate-200 text-center">

                        <button
                          onClick={() =>
                            handleToggleVoid(
                              e.id
                            )
                          }
                          className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                            e.isVoided
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          }`}
                        >
                          {e.isVoided
                            ? 'Unvoid'
                            : 'Void'}
                        </button>

                      </td>

                    </tr>
                  )
                )}

            </tbody>

          </table>

        </div>
      )}

      {/* ========================================================
          4. BIR GENERAL JOURNAL
          ONLY BIR ONLY + BIR & INHOUSE
      ======================================================== */}

      {activeTab === 'journal' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">

          <div className="flex justify-between items-center mb-5">

            <div>
              <h2 className="text-base font-bold text-slate-900">
                General Journal (Official Books)
              </h2>

              <p className="text-xs text-slate-500">
                ONLY BIR ONLY + BIR & INHOUSE
              </p>
            </div>

            <button
              onClick={() =>
                exportToCSV(
                  'BIR_General_Journal',
                  birEntries.map(
                    (e) => ({
                      Date: e.date,
                      DebitAccount:
                        e.debitAccount,
                      CreditAccount:
                        e.creditAccount,
                      Particulars:
                        e.particulars,
                      RefNo: e.refNo,
                      Scope:
                        e.transactionScope,
                      Amount: e.amount,
                      Status:
                        e.isVoided
                          ? 'VOIDED'
                          : 'VALID',
                    })
                  )
                )
              }
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 py-2 rounded-lg font-bold transition"
            >
              📥 Export CSV
            </button>

          </div>

          <table className="w-full text-left border-collapse text-xs">

            <thead>

              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">

                <th className="p-3 border border-slate-200">
                  Date
                </th>

                <th className="p-3 border border-slate-200">
                  Account Titles & Particulars
                </th>

                <th className="p-3 border border-slate-200">
                  Ref #
                </th>

                <th className="p-3 border border-slate-200">
                  Scope
                </th>

                <th className="p-3 border border-slate-200 text-right">
                  Debit
                </th>

                <th className="p-3 border border-slate-200 text-right">
                  Credit
                </th>

                <th className="p-3 border border-slate-200 text-center">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {birEntries.map(
                (e) => (
                  <React.Fragment
                    key={e.id}
                  >

                    <tr
                      className={`border-t border-slate-200 ${
                        e.isVoided
                          ? 'bg-rose-50 text-rose-500 line-through'
                          : ''
                      }`}
                    >

                      <td className="p-2.5 border border-slate-200 font-mono text-[11px]">
                        {e.date}
                      </td>

                      <td className="p-2.5 border border-slate-200 font-bold text-indigo-950">
                        {e.debitAccount}
                      </td>

                      <td className="p-2.5 border border-slate-200 font-mono">
                        {e.refNo}
                      </td>

                      <td className="p-2.5 border border-slate-200 font-bold text-indigo-600">
                        {e.transactionScope}
                      </td>

                      <td className="p-2.5 border border-slate-200 text-right font-mono font-bold text-indigo-900">
                        {formatAmount(
                          e.amount
                        )}
                      </td>

                      <td className="p-2.5 border border-slate-200 text-right font-mono text-slate-300">
                        -
                      </td>

                      <td
                        className="p-2.5 border border-slate-200 text-center"
                        rowSpan={3}
                      >

                        <button
                          onClick={() =>
                            handleToggleVoid(
                              e.id
                            )
                          }
                          className={`text-[11px] px-2.5 py-1 rounded font-bold ${
                            e.isVoided
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          }`}
                        >
                          {e.isVoided
                            ? 'Unvoid'
                            : 'Void'}
                        </button>

                      </td>

                    </tr>

                    <tr
                      className={`${
                        e.isVoided
                          ? 'bg-rose-50 text-rose-500 line-through'
                          : ''
                      }`}
                    >

                      <td className="p-2.5 border border-slate-200"></td>

                      <td className="p-2.5 border border-slate-200 pl-8 font-bold text-emerald-950">
                        {e.creditAccount}
                      </td>

                      <td className="p-2.5 border border-slate-200 font-mono">
                        {e.refNo}
                      </td>

                      <td className="p-2.5 border border-slate-200 font-bold text-indigo-600">
                        {e.transactionScope}
                      </td>

                      <td className="p-2.5 border border-slate-200 text-right font-mono text-slate-300">
                        -
                      </td>

                      <td className="p-2.5 border border-slate-200 text-right font-mono font-bold text-emerald-900">
                        {formatAmount(
                          e.amount
                        )}
                      </td>

                    </tr>

                    <tr
                      className={`border-b border-slate-200 bg-slate-50/50 ${
                        e.isVoided
                          ? 'bg-rose-50 text-rose-500 line-through'
                          : ''
                      }`}
                    >

                      <td className="p-1.5 border border-slate-200"></td>

                      <td
                        colSpan={5}
                        className="p-1.5 border border-slate-200 pl-12 text-[11px] italic text-slate-500 font-medium"
                      >
                        ({e.particulars})
                      </td>

                    </tr>

                  </React.Fragment>
                )
              )}

            </tbody>

          </table>

        </div>
      )}

      {/* ========================================================
          5. BIR GENERAL LEDGER
          ONLY BIR ONLY + BIR & INHOUSE
      ======================================================== */}

      {activeTab === 'ledger' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">

          <div className="mb-6">

            <h2 className="text-base font-bold text-slate-900">
              General Ledger T-Accounts
            </h2>

            <p className="text-xs text-slate-500">
              Official posted balances — BIR ONLY + BIR & INHOUSE only
            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {accounts.map(
              (acc) => {

                const activeValidEntries =
                  birEntries.filter(
                    (e) =>
                      !e.isVoided
                  );

                const debitEntries =
                  activeValidEntries.filter(
                    (e) =>
                      e.debitAccount ===
                      acc.name
                  );

                const creditEntries =
                  activeValidEntries.filter(
                    (e) =>
                      e.creditAccount ===
                      acc.name
                  );

                const totalDebit =
                  debitEntries.reduce(
                    (sum, e) =>
                      sum + e.amount,
                    0
                  );

                const totalCredit =
                  creditEntries.reduce(
                    (sum, e) =>
                      sum + e.amount,
                    0
                  );

                const netBalance =
                  totalDebit -
                  totalCredit;

                return (
                  <div
                    key={acc.id}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs"
                  >

                    <div className="bg-slate-900 text-white p-4">

                      <div className="flex justify-between items-center gap-3">

                        <div className="flex items-center gap-3 min-w-0">

                          <h3 className="font-extrabold text-xs uppercase tracking-wider truncate">
                            {acc.name}
                          </h3>

                          <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-300 font-bold shrink-0">
                            {acc.type}
                          </span>

                        </div>

                        {/* ====================================================
                            NEW FEATURE:
                            EXPORT THIS ACCOUNT'S GENERAL LEDGER TO CSV
                        ==================================================== */}

                        <button
                          type="button"
                          onClick={() =>
                            exportGeneralLedgerAccountCSV(
                              acc
                            )
                          }
                          className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold transition border border-indigo-500"
                          title={`Export ${acc.name} General Ledger to CSV`}
                        >
                          📥 Export CSV
                        </button>

                      </div>

                      <div className="grid grid-cols-3 text-xs mt-3 pt-2.5 border-t border-slate-800 text-slate-300 font-mono">

                        <div>
                          DR:{' '}
                          <b className="text-white">
                            {formatAmount(
                              totalDebit
                            )}
                          </b>
                        </div>

                        <div>
                          CR:{' '}
                          <b className="text-white">
                            {formatAmount(
                              totalCredit
                            )}
                          </b>
                        </div>

                        <div>
                          NET:{' '}
                          <b className="text-indigo-400">
                            {formatAmount(
                              Math.abs(
                                netBalance
                              )
                            )}
                          </b>
                        </div>

                      </div>

                    </div>

                    <div className="p-2 overflow-x-auto">

                      <table className="w-full text-xs text-left border-collapse">

                        <thead>

                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">

                            <th className="p-2 border border-slate-200">
                              Date
                            </th>

                            <th className="p-2 border border-slate-200">
                              Particulars
                            </th>

                            <th className="p-2 border border-slate-200 text-right">
                              Debit
                            </th>

                            <th className="p-2 border border-slate-200 text-right">
                              Credit
                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {birEntries
                            .filter(
                              (e) =>
                                e.debitAccount ===
                                  acc.name ||
                                e.creditAccount ===
                                  acc.name
                            )
                            .map(
                              (e) => {

                                const isDebit =
                                  e.debitAccount ===
                                  acc.name;

                                return (
                                  <tr
                                    key={e.id}
                                    className={`border-b border-slate-100 hover:bg-slate-50 transition ${
                                      e.isVoided
                                        ? 'bg-rose-50 text-rose-400 line-through'
                                        : ''
                                    }`}
                                  >

                                    <td className="p-2 border border-slate-200 text-slate-500 font-mono text-[11px]">
                                      {e.date}
                                    </td>

                                    <td className="p-2 border border-slate-200 font-medium truncate max-w-[120px]">
                                      {e.particulars}
                                    </td>

                                    <td className="p-2 border border-slate-200 text-right font-mono font-bold text-indigo-700">
                                      {isDebit
                                        ? formatAmount(
                                            e.amount
                                          )
                                        : '-'}
                                    </td>

                                    <td className="p-2 border border-slate-200 text-right font-mono font-bold text-emerald-700">
                                      {!isDebit
                                        ? formatAmount(
                                            e.amount
                                          )
                                        : '-'}
                                    </td>

                                  </tr>
                                );
                              }
                            )}

                        </tbody>

                      </table>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>
      )}

      {/* ========================================================
          6. BIR ONLY BOOKS
          
          BIR ONLY + BIR & INHOUSE
      ======================================================== */}

      {activeTab ===
        'birOnlyBooks' &&
        renderScopeBook(
          '📘 BIR ONLY BOOKS',
          'Contains BIR ONLY and BIR & INHOUSE transactions. IN HOUSE ONLY transactions are excluded.',
          birOnlyEntries,
          'BIR_ONLY_BOOKS',
          'indigo'
        )}

      {/* ========================================================
          7. BIR & INHOUSE BOOKS
          
          ALL THREE TRANSACTION SCOPES
      ======================================================== */}

      {activeTab ===
        'birInhouseBooks' &&
        renderScopeBook(
          '📗 BIR & INHOUSE BOOKS',
          'Contains BIR ONLY, BIR & INHOUSE, and IN HOUSE ONLY transactions.',
          birInhouseEntries,
          'BIR_AND_INHOUSE_BOOKS',
          'amber'
        )}

      {/* ========================================================
          8. IN HOUSE ONLY BOOKS
          
          ONLY IN HOUSE ONLY
      ======================================================== */}

      {activeTab === 'inhouse' && (
        <div className="space-y-6">

          {/* INTERNAL DASHBOARD */}

          <div className="bg-amber-500/10 border border-amber-300/60 p-6 rounded-2xl shadow-2xs">

            <div className="flex flex-wrap justify-between items-start gap-4 mb-5">

              <div>

                <h2 className="text-base font-bold text-amber-950">
                  🏠 IN-HOUSE ONLY BOOKS
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Only transactions tagged IN HOUSE ONLY.
                </p>

              </div>

              <span className="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-[10px] font-black">
                NOT INCLUDED IN BIR OFFICIAL BOOKS
              </span>

            </div>

            {(() => {

              const validInhouse =
                inHouseOnlyEntries.filter(
                  (e) =>
                    !e.isVoided
                );

              const sales =
                validInhouse
                  .filter(
                    (e) =>
                      e.creditAccount ===
                        'SALES INCOME' ||
                      accountTypeMap.get(
                        e.creditAccount
                      ) === 'Income'
                  )
                  .reduce(
                    (sum, e) =>
                      sum + e.amount,
                    0
                  );

              const expenses =
                validInhouse
                  .filter(
                    (e) =>
                      accountTypeMap.get(
                        e.debitAccount
                      ) === 'Expense'
                  )
                  .reduce(
                    (sum, e) =>
                      sum + e.amount,
                    0
                  );

              const net =
                sales - expenses;

              return (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">

                  <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs">

                    <span className="text-slate-500 font-bold block uppercase tracking-wider">
                      TRANSACTIONS
                    </span>

                    <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                      {
                        validInhouse.length
                      }
                    </span>

                  </div>

                  <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs">

                    <span className="text-slate-500 font-bold block uppercase tracking-wider">
                      SALES
                    </span>

                    <span className="text-xl font-black text-emerald-600 font-mono mt-1 block">
                      {formatAmount(
                        sales
                      )}
                    </span>

                  </div>

                  <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs">

                    <span className="text-slate-500 font-bold block uppercase tracking-wider">
                      EXPENSES
                    </span>

                    <span className="text-xl font-black text-rose-600 font-mono mt-1 block">
                      {formatAmount(
                        expenses
                      )}
                    </span>

                  </div>

                  <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs">

                    <span className="text-slate-500 font-bold block uppercase tracking-wider">
                      NET
                    </span>

                    <span
                      className={`text-xl font-black font-mono mt-1 block ${
                        net >= 0
                          ? 'text-slate-900'
                          : 'text-rose-700'
                      }`}
                    >
                      {formatAmount(
                        net
                      )}
                    </span>

                  </div>

                </div>
              );

            })()}

          </div>

          {/* INTERNAL TABLE */}

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">

            <div className="flex justify-between items-center mb-5">

              <div>

                <h2 className="text-base font-bold text-slate-900">
                  In-House Only Ledger Journal
                </h2>

                <p className="text-xs text-slate-500">
                  ONLY IN HOUSE ONLY transactions
                </p>

              </div>

              <button
                onClick={() =>
                  exportToCSV(
                    'InHouse_Only_Books',
                    inHouseOnlyEntries.map(
                      (e) => ({
                        Date: e.date,
                        Particulars:
                          e.particulars,
                        RefNo:
                          e.refNo,
                        Scope:
                          e.transactionScope,
                        DebitAccount:
                          e.debitAccount,
                        CreditAccount:
                          e.creditAccount,
                        Amount:
                          e.amount,
                        Status:
                          e.isVoided
                            ? 'VOIDED'
                            : 'VALID',
                      })
                    )
                  )
                }
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 py-2 rounded-lg font-bold transition"
              >
                📥 Export CSV
              </button>

            </div>

            <table className="w-full text-left border-collapse text-xs">

              <thead>

                <tr className="bg-amber-100/60 border-b border-amber-200 text-amber-950 font-bold uppercase tracking-wider">

                  <th className="p-3 border border-amber-200">
                    Date
                  </th>

                  <th className="p-3 border border-amber-200">
                    Particulars
                  </th>

                  <th className="p-3 border border-amber-200">
                    Ref #
                  </th>

                  <th className="p-3 border border-amber-200">
                    Scope
                  </th>

                  <th className="p-3 border border-amber-200">
                    Debit (DR)
                  </th>

                  <th className="p-3 border border-amber-200">
                    Credit (CR)
                  </th>

                  <th className="p-3 border border-amber-200 text-right">
                    Amount
                  </th>

                  <th className="p-3 border border-amber-200 text-center">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {inHouseOnlyEntries.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-8 text-center text-slate-400"
                    >
                      No IN HOUSE ONLY transactions.
                    </td>
                  </tr>
                ) : (
                  inHouseOnlyEntries.map(
                    (e) => (
                      <tr
                        key={e.id}
                        className={`border-b border-slate-100 hover:bg-slate-50 transition ${
                          e.isVoided
                            ? 'bg-rose-50 text-rose-500 line-through'
                            : ''
                        }`}
                      >

                        <td className="p-3 border border-slate-200 font-mono text-[11px]">
                          {e.date}
                        </td>

                        <td className="p-3 border border-slate-200 font-semibold">
                          {e.particulars}
                        </td>

                        <td className="p-3 border border-slate-200 font-mono">
                          {e.refNo}
                        </td>

                        <td className="p-3 border border-slate-200 font-bold text-amber-800">
                          {e.transactionScope}
                        </td>

                        <td className="p-3 border border-slate-200 font-bold text-indigo-900">
                          {e.debitAccount}
                        </td>

                        <td className="p-3 border border-slate-200 font-bold text-emerald-900">
                          {e.creditAccount}
                        </td>

                        <td className="p-3 border border-slate-200 text-right font-mono font-black">
                          {formatAmount(
                            e.amount
                          )}
                        </td>

                        <td className="p-3 border border-slate-200 text-center">

                          <button
                            onClick={() =>
                              handleToggleVoid(
                                e.id
                              )
                            }
                            className={`text-[11px] px-2.5 py-1 rounded font-bold ${
                              e.isVoided
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            }`}
                          >
                            {e.isVoided
                              ? 'Unvoid'
                              : 'Void'}
                          </button>

                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>
      )}

      {/* ========================================================
          9. COMPLETE FINANCIAL STATEMENTS

          SEPARATED BY TRANSACTION TYPE:
          - BIR ONLY
          - IN HOUSE ONLY
          - BIR & INHOUSE

          Statements included:
          1. Income Statement
          2. Statement of Changes in Equity
          3. Balance Sheet / Statement of Financial Position
          4. Statement of Cash Flows
          5. Trial Balance / Accounting Equation Check
      ======================================================== */}

      {activeTab === 'reports' && (
        <div className="space-y-6">

          {/* REPORT SCOPE SELECTOR */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">
                  Complete Financial Statements
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Financial statements are generated separately from the selected transaction type.
                  Voided transactions are excluded.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
                {([
                  {
                    id: 'BIR ONLY' as TransactionScope,
                    title: 'BIR ONLY',
                    sub: 'Official BIR data only',
                  },
                  {
                    id: 'IN HOUSE ONLY' as TransactionScope,
                    title: 'IN HOUSE ONLY',
                    sub: 'Internal data only',
                  },
                  {
                    id: 'BIR & INHOUSE' as TransactionScope,
                    title: 'BIR & INHOUSE',
                    sub: 'BIR & internal data',
                  },
                ]).map((scope) => (
                  <button
                    key={scope.id}
                    type="button"
                    onClick={() =>
                      setFinancialStatementScope(scope.id)
                    }
                    className={`px-4 py-2.5 rounded-lg text-center transition-all ${
                      financialStatementScope === scope.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-transparent text-slate-600 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <div className="text-[11px] font-black">
                      {scope.title}
                    </div>
                    <div
                      className={`text-[9px] mt-0.5 ${
                        financialStatementScope === scope.id
                          ? 'text-indigo-100'
                          : 'text-slate-400'
                      }`}
                    >
                      {scope.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(() => {
            /* ======================================================
               SOURCE DATA FOR THE SELECTED TRANSACTION TYPE
            ====================================================== */
            const statementEntries = filteredEntries.filter(
              (e) =>
                !e.isVoided &&
                e.transactionScope === financialStatementScope
            );

            const getDebit = (accountName: string) =>
              statementEntries
                .filter((e) => e.debitAccount === accountName)
                .reduce((sum, e) => sum + e.amount, 0);

            const getCredit = (accountName: string) =>
              statementEntries
                .filter((e) => e.creditAccount === accountName)
                .reduce((sum, e) => sum + e.amount, 0);

            /* ======================================================
               INCOME STATEMENT
            ====================================================== */
            const incomeDetails = accounts
              .filter((a) => a.type === 'Income')
              .map((acc) => ({
                name: acc.name,
                total: getCredit(acc.name) - getDebit(acc.name),
              }))
              .filter((a) => Math.abs(a.total) > 0.0000001);

            const expenseDetails = accounts
              .filter((a) => a.type === 'Expense')
              .map((acc) => ({
                name: acc.name,
                total: getDebit(acc.name) - getCredit(acc.name),
              }))
              .filter((a) => Math.abs(a.total) > 0.0000001);

            const totalIncome = incomeDetails.reduce(
              (sum, item) => sum + item.total,
              0
            );

            const totalExpense = expenseDetails.reduce(
              (sum, item) => sum + item.total,
              0
            );

            const netIncome = totalIncome - totalExpense;

            /* ======================================================
               BALANCE SHEET
            ====================================================== */
            const assetDetails = accounts
              .filter((a) => a.type === 'Asset')
              .map((acc) => ({
                name: acc.name,
                total: getDebit(acc.name) - getCredit(acc.name),
              }))
              .filter((a) => Math.abs(a.total) > 0.0000001);

            const liabilityDetails = accounts
              .filter((a) => a.type === 'Liability')
              .map((acc) => ({
                name: acc.name,
                total: getCredit(acc.name) - getDebit(acc.name),
              }))
              .filter((a) => Math.abs(a.total) > 0.0000001);

            const equityAccountDetails = accounts
              .filter((a) => a.type === 'Equity')
              .map((acc) => ({
                name: acc.name,
                total: getCredit(acc.name) - getDebit(acc.name),
              }))
              .filter((a) => Math.abs(a.total) > 0.0000001);

            const totalAssets = assetDetails.reduce(
              (sum, item) => sum + item.total,
              0
            );

            const totalLiabilities = liabilityDetails.reduce(
              (sum, item) => sum + item.total,
              0
            );

            const totalEquityAccounts = equityAccountDetails.reduce(
              (sum, item) => sum + item.total,
              0
            );

            /* Current period profit/loss is presented separately in equity.
               This lets the balance sheet include the current period result
               even when no closing entry has yet been posted. */
            const totalEquity = totalEquityAccounts + netIncome;
            const liabilitiesAndEquity =
              totalLiabilities + totalEquity;
            const balanceDifference =
              totalAssets - liabilitiesAndEquity;

            /* ======================================================
               CASH FLOW STATEMENT - DIRECT METHOD

               Cash accounts are identified from Asset accounts whose
               names contain CASH or BANK. Transfers between cash
               accounts are excluded from operating/investing/financing
               cash flow because they do not change total cash.
            ====================================================== */
            const cashAccounts = accounts
              .filter(
                (a) =>
                  a.type === 'Asset' &&
                  /CASH|BANK/i.test(a.name)
              )
              .map((a) => a.name);

            const cashEntries = statementEntries.filter(
              (e) =>
                cashAccounts.includes(e.debitAccount) ||
                cashAccounts.includes(e.creditAccount)
            );

            const cashFlowClass = (
              entry: DoubleEntry
            ): 'OPERATING' | 'INVESTING' | 'FINANCING' | 'TRANSFER' | 'OTHER' => {
              const debitIsCash = cashAccounts.includes(entry.debitAccount);
              const creditIsCash = cashAccounts.includes(entry.creditAccount);

              if (debitIsCash && creditIsCash) {
                return 'TRANSFER';
              }

              const nonCashAccount = debitIsCash
                ? entry.creditAccount
                : entry.debitAccount;
              const nonCashType = accountTypeMap.get(nonCashAccount);

              if (nonCashType === 'Income' || nonCashType === 'Expense') {
                return 'OPERATING';
              }

              if (nonCashType === 'Asset') {
                return 'INVESTING';
              }

              if (
                nonCashType === 'Liability' ||
                nonCashType === 'Equity'
              ) {
                return 'FINANCING';
              }

              return 'OTHER';
            };

            const cashFlowNet = (
              category:
                | 'OPERATING'
                | 'INVESTING'
                | 'FINANCING'
                | 'OTHER'
            ) =>
              cashEntries
                .filter((e) => cashFlowClass(e) === category)
                .reduce((sum, e) => {
                  const cashIn = cashAccounts.includes(e.debitAccount);
                  const cashOut = cashAccounts.includes(e.creditAccount);
                  return sum + (cashIn ? e.amount : 0) - (cashOut ? e.amount : 0);
                }, 0);

            const operatingCashFlow = cashFlowNet('OPERATING');
            const investingCashFlow = cashFlowNet('INVESTING');
            const financingCashFlow = cashFlowNet('FINANCING');
            const otherCashFlow = cashFlowNet('OTHER');
            const netCashChange =
              operatingCashFlow +
              investingCashFlow +
              financingCashFlow +
              otherCashFlow;

            const cashBalance = assetDetails
              .filter((a) => cashAccounts.includes(a.name))
              .reduce((sum, item) => sum + item.total, 0);

            /* ======================================================
               TRIAL BALANCE
            ====================================================== */
            const trialBalanceRows = accounts
              .map((acc) => {
                const debit = getDebit(acc.name);
                const credit = getCredit(acc.name);
                return {
                  ...acc,
                  debit,
                  credit,
                };
              })
              .filter(
                (row) =>
                  Math.abs(row.debit) > 0.0000001 ||
                  Math.abs(row.credit) > 0.0000001
              );

            const trialDebit = trialBalanceRows.reduce(
              (sum, row) => sum + row.debit,
              0
            );
            const trialCredit = trialBalanceRows.reduce(
              (sum, row) => sum + row.credit,
              0
            );
            const trialDifference = trialDebit - trialCredit;

            const reportLabel =
              financialStatementScope === 'BIR ONLY'
                ? 'BIR ONLY'
                : financialStatementScope === 'IN HOUSE ONLY'
                ? 'IN HOUSE ONLY'
                : 'BIR & INHOUSE';

            const reportPeriod =
              startDate || endDate
                ? `${startDate || 'Beginning'} to ${endDate || 'Current'}`
                : 'All recorded dates';

            const exportFilePrefix = `Financial_Statement_${reportLabel.replace(/[^a-zA-Z0-9]+/g, '_')}`;

            /* ======================================================
               INDIVIDUAL CSV EXPORT DATASETS
               Each financial statement gets its own CSV file.
            ====================================================== */
            const incomeStatementCSVRows = [
              {
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'REVENUE',
                Account: '',
                Amount: '',
              },
              ...incomeDetails.map((item) => ({
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'Revenue',
                Account: item.name,
                Amount: item.total,
              })),
              {
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'TOTAL REVENUE',
                Account: '',
                Amount: totalIncome,
              },
              {
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'OPERATING EXPENSES',
                Account: '',
                Amount: '',
              },
              ...expenseDetails.map((item) => ({
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'Operating Expense',
                Account: item.name,
                Amount: item.total,
              })),
              {
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'TOTAL EXPENSES',
                Account: '',
                Amount: totalExpense,
              },
              {
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: netIncome >= 0 ? 'NET INCOME' : 'NET LOSS',
                Account: '',
                Amount: netIncome,
              },
            ];

            const statementOfChangesInEquityCSVRows = [
              ...equityAccountDetails.map((item) => ({
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'Equity Account',
                Account: item.name,
                Amount: item.total,
              })),
              {
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'Current Period Net Income / (Loss)',
                Account: '',
                Amount: netIncome,
              },
              {
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'TOTAL EQUITY',
                Account: '',
                Amount: totalEquity,
              },
            ];

            const balanceSheetCSVRows = [
              ...assetDetails.map((item) => ({
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'Assets',
                Account: item.name,
                Amount: item.total,
              })),
              {
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'TOTAL ASSETS',
                Account: '',
                Amount: totalAssets,
              },
              ...liabilityDetails.map((item) => ({
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'Liabilities',
                Account: item.name,
                Amount: item.total,
              })),
              {
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'TOTAL LIABILITIES',
                Account: '',
                Amount: totalLiabilities,
              },
              ...equityAccountDetails.map((item) => ({
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'Equity Accounts',
                Account: item.name,
                Amount: item.total,
              })),
              {
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'Current Period Net Income / (Loss)',
                Account: '',
                Amount: netIncome,
              },
              {
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'TOTAL EQUITY',
                Account: '',
                Amount: totalEquity,
              },
              {
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'TOTAL LIABILITIES & EQUITY',
                Account: '',
                Amount: liabilitiesAndEquity,
              },
              {
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'ACCOUNTING EQUATION DIFFERENCE',
                Account: '',
                Amount: balanceDifference,
              },
            ];

            const cashFlowCSVRows = [
              {
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'CASH ACCOUNTS IDENTIFIED',
                Account: cashAccounts.join(', '),
                Classification: '',
                CashEffect: '',
                Date: '',
                Particulars: '',
                DebitAccount: '',
                CreditAccount: '',
                Amount: '',
              },
              ...cashEntries.map((entry) => {
                const classification = cashFlowClass(entry);
                const cashIn = cashAccounts.includes(entry.debitAccount);
                const cashOut = cashAccounts.includes(entry.creditAccount);
                const effect =
                  classification === 'TRANSFER'
                    ? 0
                    : cashIn
                    ? entry.amount
                    : cashOut
                    ? -entry.amount
                    : 0;

                return {
                  TransactionType: reportLabel,
                  Period: reportPeriod,
                  Section: 'Cash Flow Transaction',
                  Account: '',
                  Classification: classification,
                  CashEffect: effect,
                  Date: entry.date,
                  Particulars: entry.particulars,
                  DebitAccount: entry.debitAccount,
                  CreditAccount: entry.creditAccount,
                  Amount: entry.amount,
                };
              }),
              {
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'Operating Activities',
                Account: '',
                Classification: 'OPERATING',
                CashEffect: operatingCashFlow,
                Date: '',
                Particulars: '',
                DebitAccount: '',
                CreditAccount: '',
                Amount: '',
              },
              {
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'Investing Activities',
                Account: '',
                Classification: 'INVESTING',
                CashEffect: investingCashFlow,
                Date: '',
                Particulars: '',
                DebitAccount: '',
                CreditAccount: '',
                Amount: '',
              },
              {
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'Financing Activities',
                Account: '',
                Classification: 'FINANCING',
                CashEffect: financingCashFlow,
                Date: '',
                Particulars: '',
                DebitAccount: '',
                CreditAccount: '',
                Amount: '',
              },
              {
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'Other Cash Activities',
                Account: '',
                Classification: 'OTHER',
                CashEffect: otherCashFlow,
                Date: '',
                Particulars: '',
                DebitAccount: '',
                CreditAccount: '',
                Amount: '',
              },
              {
                TransactionType: reportLabel,
                Period: reportPeriod,
                Section: 'NET CHANGE IN CASH',
                Account: '',
                Classification: '',
                CashEffect: netCashChange,
                Date: '',
                Particulars: '',
                DebitAccount: '',
                CreditAccount: '',
                Amount: '',
              },
            ];

            const trialBalanceCSVRows = [
              ...trialBalanceRows.map((row) => ({
                TransactionType: reportLabel,
                Period: reportPeriod,
                Account: row.name,
                Type: row.type,
                Debit: row.debit,
                Credit: row.credit,
              })),
              {
                TransactionType: reportLabel,
                Period: reportPeriod,
                Account: 'TOTAL',
                Type: '',
                Debit: trialDebit,
                Credit: trialCredit,
              },
              {
                TransactionType: reportLabel,
                Period: reportPeriod,
                Account: 'Difference',
                Type: Math.abs(trialDifference) < 0.01
                  ? 'DEBITS = CREDITS'
                  : 'CHECK POSTINGS',
                Debit: trialDifference,
                Credit: '',
              },
            ];

            return (
              <div className="max-w-4xl mx-auto space-y-4 text-[10px] leading-tight">

                {/* REPORT HEADER */}
                <div className="bg-slate-900 text-white p-4 rounded-xl shadow-sm">
                  <div className="flex flex-wrap justify-between items-start gap-3">
                    <div>
                      <div className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">
                        Financial Reporting Package
                      </div>
                      <h1 className="text-base font-black mt-1">
                        {reportLabel}
                      </h1>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Period: {reportPeriod}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        Valid Transactions
                      </div>
                      <div className="text-base font-black font-mono">
                        {statementEntries.length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-black">
                      Total Revenue
                    </div>
                    <div className="text-base font-black font-mono text-emerald-700 mt-1">
                      {formatAmount(totalIncome)}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-black">
                      Total Expenses
                    </div>
                    <div className="text-base font-black font-mono text-rose-700 mt-1">
                      {formatAmount(totalExpense)}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-black">
                      Net Income / (Loss)
                    </div>
                    <div
                      className={`text-base font-black font-mono mt-1 ${
                        netIncome >= 0
                          ? 'text-indigo-900'
                          : 'text-rose-700'
                      }`}
                    >
                      {formatAmount(netIncome)}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-black">
                      Cash Balance
                    </div>
                    <div className="text-base font-black font-mono text-slate-900 mt-1">
                      {formatAmount(cashBalance)}
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    1. INCOME STATEMENT
                ================================================== */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-indigo-950 text-white p-3.5 flex flex-wrap justify-between items-center gap-2.5">
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider">
                        1. Income Statement
                      </h2>
                      <p className="text-[10px] text-indigo-200 mt-1">
                        Revenue and expenses for {reportLabel} transactions.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        exportToCSV(
                          `${exportFilePrefix}_Income_Statement`,
                          incomeStatementCSVRows
                        )
                      }
                      className="bg-white text-indigo-950 hover:bg-indigo-50 text-[10px] px-3 py-1.5 rounded-lg font-black transition"
                    >
                      📥 CSV Income Statement
                    </button>
                  </div>

                  <div className="p-4 text-[10px] space-y-4">
                    <div>
                      <div className="flex justify-between border-b-2 border-slate-900 pb-2 mb-2 font-black uppercase">
                        <span>Revenue</span>
                        <span>Amount</span>
                      </div>

                      {incomeDetails.length === 0 ? (
                        <div className="py-3 pl-4 text-slate-400 italic">
                          No income accounts recorded.
                        </div>
                      ) : (
                        incomeDetails.map((item) => (
                          <div
                            key={item.name}
                            className="flex justify-between py-1 pl-4"
                          >
                            <span className="font-medium text-slate-700">
                              {item.name}
                            </span>
                            <span className="font-mono font-bold">
                              {formatAmount(item.total)}
                            </span>
                          </div>
                        ))
                      )}

                      <div className="flex justify-between border-t border-slate-300 pt-2 mt-2 font-black text-emerald-700">
                        <span>TOTAL REVENUE</span>
                        <span className="font-mono">
                          {formatAmount(totalIncome)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between border-b-2 border-slate-900 pb-2 mb-2 font-black uppercase">
                        <span>Operating Expenses</span>
                        <span>Amount</span>
                      </div>

                      {expenseDetails.length === 0 ? (
                        <div className="py-3 pl-4 text-slate-400 italic">
                          No expense accounts recorded.
                        </div>
                      ) : (
                        expenseDetails.map((item) => (
                          <div
                            key={item.name}
                            className="flex justify-between py-1 pl-4"
                          >
                            <span className="font-medium text-slate-700">
                              {item.name}
                            </span>
                            <span className="font-mono font-bold">
                              {formatAmount(item.total)}
                            </span>
                          </div>
                        ))
                      )}

                      <div className="flex justify-between border-t border-slate-300 pt-2 mt-2 font-black text-rose-700">
                        <span>TOTAL EXPENSES</span>
                        <span className="font-mono">
                          {formatAmount(totalExpense)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between border-y-2 border-slate-900 bg-slate-50 px-3 py-2 text-[10px] font-black">
                      <span>
                        {netIncome >= 0 ? 'NET INCOME' : 'NET LOSS'}
                      </span>
                      <span className="font-mono">
                        {formatAmount(netIncome)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    2. STATEMENT OF CHANGES IN EQUITY
                ================================================== */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-900 text-white p-3.5 flex flex-wrap justify-between items-center gap-2.5">
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider">
                        2. Statement of Changes in Equity
                      </h2>
                      <p className="text-[10px] text-slate-300 mt-1">
                        Equity accounts plus current-period net income.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        exportToCSV(
                          `${exportFilePrefix}_Changes_in_Equity`,
                          statementOfChangesInEquityCSVRows
                        )
                      }
                      className="bg-white text-slate-900 hover:bg-slate-100 text-[10px] px-3 py-1.5 rounded-lg font-black transition"
                    >
                      📥 CSV Changes in Equity
                    </button>
                  </div>

                  <div className="p-4 text-[10px]">
                    {equityAccountDetails.length === 0 ? (
                      <div className="py-3 text-slate-400 italic">
                        No equity account transactions recorded.
                      </div>
                    ) : (
                      equityAccountDetails.map((item) => (
                        <div
                          key={item.name}
                          className="flex justify-between py-1.5 pl-4"
                        >
                          <span className="font-medium text-slate-700">
                            {item.name}
                          </span>
                          <span className="font-mono font-bold">
                            {formatAmount(item.total)}
                          </span>
                        </div>
                      ))
                    )}

                    <div className="flex justify-between py-1.5 pl-4 border-t border-slate-200 mt-2 pt-3">
                      <span className="font-medium text-slate-700">
                        Add: Current Period Net Income / (Loss)
                      </span>
                      <span className="font-mono font-bold">
                        {formatAmount(netIncome)}
                      </span>
                    </div>

                    <div className="flex justify-between border-t-2 border-b-2 border-slate-900 bg-slate-50 px-3 py-2 mt-3 font-black text-xs">
                      <span>TOTAL EQUITY</span>
                      <span className="font-mono">
                        {formatAmount(totalEquity)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    3. BALANCE SHEET
                ================================================== */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-emerald-950 text-white p-3.5 flex flex-wrap justify-between items-center gap-2.5">
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider">
                        3. Balance Sheet / Statement of Financial Position
                      </h2>
                      <p className="text-[10px] text-emerald-200 mt-1">
                        Assets = Liabilities + Equity for {reportLabel} transactions.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        exportToCSV(
                          `${exportFilePrefix}_Balance_Sheet`,
                          balanceSheetCSVRows
                        )
                      }
                      className="bg-white text-emerald-950 hover:bg-emerald-50 text-[10px] px-3 py-1.5 rounded-lg font-black transition"
                    >
                      📥 CSV Balance Sheet
                    </button>
                  </div>

                  <div className="p-4 text-[10px] space-y-4">
                    <div>
                      <div className="border-b-2 border-slate-900 pb-2 mb-2 font-black uppercase">
                        Assets
                      </div>
                      {assetDetails.length === 0 ? (
                        <div className="py-3 pl-4 text-slate-400 italic">
                          No asset balances recorded.
                        </div>
                      ) : (
                        assetDetails.map((item) => (
                          <div
                            key={item.name}
                            className="flex justify-between py-1 pl-4"
                          >
                            <span className="font-medium text-slate-700">
                              {item.name}
                            </span>
                            <span className="font-mono font-bold">
                              {formatAmount(item.total)}
                            </span>
                          </div>
                        ))
                      )}
                      <div className="flex justify-between border-t border-slate-300 pt-2 mt-2 font-black text-indigo-900">
                        <span>TOTAL ASSETS</span>
                        <span className="font-mono">
                          {formatAmount(totalAssets)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="border-b-2 border-slate-900 pb-2 mb-2 font-black uppercase">
                        Liabilities
                      </div>
                      {liabilityDetails.length === 0 ? (
                        <div className="py-3 pl-4 text-slate-400 italic">
                          No liability balances recorded.
                        </div>
                      ) : (
                        liabilityDetails.map((item) => (
                          <div
                            key={item.name}
                            className="flex justify-between py-1 pl-4"
                          >
                            <span className="font-medium text-slate-700">
                              {item.name}
                            </span>
                            <span className="font-mono font-bold">
                              {formatAmount(item.total)}
                            </span>
                          </div>
                        ))
                      )}
                      <div className="flex justify-between border-t border-slate-300 pt-2 mt-2 font-black">
                        <span>TOTAL LIABILITIES</span>
                        <span className="font-mono">
                          {formatAmount(totalLiabilities)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="border-b-2 border-slate-900 pb-2 mb-2 font-black uppercase">
                        Equity
                      </div>
                      {equityAccountDetails.map((item) => (
                        <div
                          key={item.name}
                          className="flex justify-between py-1.5 pl-4"
                        >
                          <span className="font-medium text-slate-700">
                            {item.name}
                          </span>
                          <span className="font-mono font-bold">
                            {formatAmount(item.total)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between py-1.5 pl-4">
                        <span className="font-medium text-slate-700">
                          Current Period Net Income / (Loss)
                        </span>
                        <span className="font-mono font-bold">
                          {formatAmount(netIncome)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-slate-300 pt-2 mt-2 font-black">
                        <span>TOTAL EQUITY</span>
                        <span className="font-mono">
                          {formatAmount(totalEquity)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between border-y-2 border-slate-900 bg-slate-50 px-3 py-2 font-black text-xs">
                      <span>TOTAL LIABILITIES &amp; EQUITY</span>
                      <span className="font-mono">
                        {formatAmount(liabilitiesAndEquity)}
                      </span>
                    </div>

                    <div
                      className={`rounded-xl border p-4 ${
                        Math.abs(balanceDifference) < 0.01
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-rose-50 border-rose-200'
                      }`}
                    >
                      <div className="flex justify-between items-center gap-3">
                        <span className="font-black uppercase tracking-wider">
                          Accounting Equation Check
                        </span>
                        <span className="font-mono font-black text-[10px]">
                          {Math.abs(balanceDifference) < 0.01
                            ? 'BALANCED'
                            : 'OUT OF BALANCE'}
                        </span>
                      </div>
                      <div className="flex justify-between mt-2 text-[10px]">
                        <span>Difference: Assets − (Liabilities + Equity)</span>
                        <span className="font-mono font-bold">
                          {formatAmount(balanceDifference)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    4. STATEMENT OF CASH FLOWS
                ================================================== */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-cyan-950 text-white p-3.5 flex flex-wrap justify-between items-center gap-2.5">
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider">
                        4. Statement of Cash Flows
                      </h2>
                      <p className="text-[10px] text-cyan-200 mt-1">
                        Direct-method cash flow classification based on cash/bank accounts.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        exportToCSV(
                          `${exportFilePrefix}_Cash_Flows`,
                          cashFlowCSVRows
                        )
                      }
                      className="bg-white text-cyan-950 hover:bg-cyan-50 text-[10px] px-3 py-1.5 rounded-lg font-black transition"
                    >
                      📥 CSV Cash Flows
                    </button>
                  </div>

                  <div className="p-4 text-[10px] space-y-4">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="font-black uppercase">
                        Cash Accounts Identified
                      </span>
                      <span className="font-medium text-slate-600">
                        {cashAccounts.length
                          ? cashAccounts.join(', ')
                          : 'No CASH/BANK account found'}
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between py-2 font-bold">
                        <span>Net Cash Provided by Operating Activities</span>
                        <span className="font-mono">
                          {formatAmount(operatingCashFlow)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 font-bold">
                        <span>Net Cash Provided by / (Used in) Investing Activities</span>
                        <span className="font-mono">
                          {formatAmount(investingCashFlow)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 font-bold">
                        <span>Net Cash Provided by / (Used in) Financing Activities</span>
                        <span className="font-mono">
                          {formatAmount(financingCashFlow)}
                        </span>
                      </div>
                      {Math.abs(otherCashFlow) > 0.0000001 && (
                        <div className="flex justify-between py-2 font-bold">
                          <span>Other Cash Activities</span>
                          <span className="font-mono">
                            {formatAmount(otherCashFlow)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between border-y-2 border-slate-900 bg-slate-50 px-3 py-2 text-[10px] font-black">
                      <span>NET CHANGE IN CASH</span>
                      <span className="font-mono">
                        {formatAmount(netCashChange)}
                      </span>
                    </div>

                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                      <div className="text-[10px] uppercase tracking-wider font-black text-slate-600 mb-2">
                        Cash Flow Transactions
                      </div>
                      {cashEntries.length === 0 ? (
                        <div className="text-slate-400 italic">
                          No cash/bank transactions recorded for this transaction type.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-[9px] border-collapse">
                            <thead>
                              <tr className="bg-white border-b border-slate-200 font-black uppercase">
                                <th className="p-1.5 border border-slate-200 text-left">Date</th>
                                <th className="p-1.5 border border-slate-200 text-left">Particulars</th>
                                <th className="p-1.5 border border-slate-200 text-left">Classification</th>
                                <th className="p-2 border border-slate-200 text-right">Cash Effect</th>
                              </tr>
                            </thead>
                            <tbody>
                              {cashEntries.map((entry) => {
                                const classification = cashFlowClass(entry);
                                const cashIn = cashAccounts.includes(entry.debitAccount);
                                const cashOut = cashAccounts.includes(entry.creditAccount);
                                const effect =
                                  classification === 'TRANSFER'
                                    ? 0
                                    : cashIn
                                    ? entry.amount
                                    : cashOut
                                    ? -entry.amount
                                    : 0;

                                return (
                                  <tr key={entry.id} className="border-b border-slate-100">
                                        <td className="p-1.5 border border-slate-200 font-mono">{entry.date}</td>
                                    <td className="p-1.5 border border-slate-200 font-medium">{entry.particulars}</td>
                                    <td className="p-1.5 border border-slate-200 font-bold">{classification}</td>
                                    <td className="p-1.5 border border-slate-200 text-right font-mono font-black">
                                      {formatAmount(effect)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    5. TRIAL BALANCE
                ================================================== */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-900 text-white p-3.5 flex flex-wrap justify-between items-center gap-2.5">
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider">
                        5. Trial Balance
                      </h2>
                      <p className="text-[10px] text-slate-300 mt-1">
                        All active ledger postings for {reportLabel}.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        exportToCSV(
                          `${exportFilePrefix}_Trial_Balance`,
                          trialBalanceCSVRows
                        )
                      }
                      className="bg-white text-slate-900 hover:bg-slate-100 text-[10px] px-3 py-1.5 rounded-lg font-black transition"
                    >
                      📥 CSV Trial Balance
                    </button>
                  </div>

                  <div className="p-4 overflow-x-auto">
                    <table className="w-full text-[9px] border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 uppercase tracking-wider font-black">
                          <th className="p-1.5 border border-slate-200 text-left">Account</th>
                          <th className="p-1.5 border border-slate-200 text-left">Type</th>
                          <th className="p-1.5 border border-slate-200 text-right">Debit</th>
                          <th className="p-1.5 border border-slate-200 text-right">Credit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trialBalanceRows.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                              No active transactions recorded for this transaction type.
                            </td>
                          </tr>
                        ) : (
                          trialBalanceRows.map((row) => (
                            <tr key={row.id} className="border-b border-slate-100">
                              <td className="p-1.5 border border-slate-200 font-bold">{row.name}</td>
                              <td className="p-1.5 border border-slate-200 text-slate-500">{row.type}</td>
                              <td className="p-1.5 border border-slate-200 text-right font-mono">
                                {row.debit ? formatAmount(row.debit) : '-'}
                              </td>
                              <td className="p-1.5 border border-slate-200 text-right font-mono">
                                {row.credit ? formatAmount(row.credit) : '-'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-900 text-white font-black">
                          <td colSpan={2} className="p-1.5 border border-slate-700">TOTAL</td>
                          <td className="p-1.5 border border-slate-700 text-right font-mono">
                            {formatAmount(trialDebit)}
                          </td>
                          <td className="p-1.5 border border-slate-700 text-right font-mono">
                            {formatAmount(trialCredit)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>

                    <div
                      className={`mt-3 p-3 rounded-lg border ${
                        Math.abs(trialDifference) < 0.01
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      <div className="flex justify-between items-center gap-3">
                        <span className="font-black uppercase">
                          Trial Balance Status
                        </span>
                        <span className="font-mono font-black text-[10px]">
                          {Math.abs(trialDifference) < 0.01
                            ? 'DEBITS = CREDITS'
                            : 'CHECK POSTINGS'}
                        </span>
                      </div>
                      <div className="text-[9px] mt-1">
                        Difference: {formatAmount(trialDifference)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* REPORT NOTES */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[10px] text-amber-900">
                  <div className="font-black uppercase tracking-wider mb-2">
                    Financial Statement Notes
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Only non-voided transactions tagged exactly as <b>{reportLabel}</b> are included in this report.
                    </li>
                    <li>
                      The Balance Sheet presents current-period net income as part of equity so the accounting equation reflects the unclosed current-period result.
                    </li>
                    <li>
                      Cash flows are classified automatically from the account types and the CASH/BANK account names in the Chart of Accounts.
                    </li>
                    <li>
                      A transaction transfer between two cash/bank accounts is excluded from operating, investing, and financing cash flow because it does not change total cash.
                    </li>
                    <li>
                      The selected date filter applies to all financial statements.
                    </li>
                  </ul>
                </div>

              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================
          10. TIN REGISTRY
      ======================================================== */}

      {activeTab === 'tinRegistry' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full max-w-[1500px] mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">TIN Registry</h2>
              <p className="text-xs text-slate-500 mt-1">Register TIN, VAT OWNER, NON VAT OWNER, and ADDRESS for automatic lookup in Record Entry.</p>
            </div>
            <button type="button" onClick={() => { resetTinRegistryForm(); setShowTinRegisterForm((current) => !current); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold">+ REGISTER TIN</button>
          </div>

          {showTinRegisterForm && (
            <form onSubmit={handleSaveTinRegistry} className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" placeholder="TIN" value={tinRegistryTin} onChange={(e) => setTinRegistryTin(e.target.value)} className="border border-slate-300 rounded-lg p-2.5 text-xs uppercase bg-white outline-hidden focus:ring-2 focus:ring-indigo-500" required />
                <input type="text" placeholder="VAT OWNER" value={tinRegistryVatOwner} onChange={(e) => { setTinRegistryVatOwner(e.target.value); if (e.target.value.trim()) setTinRegistryNonVatOwner(''); }} className="border border-slate-300 rounded-lg p-2.5 text-xs uppercase bg-white outline-hidden focus:ring-2 focus:ring-indigo-500" />
                <input type="text" placeholder="NON VAT OWNER" value={tinRegistryNonVatOwner} onChange={(e) => { setTinRegistryNonVatOwner(e.target.value); if (e.target.value.trim()) setTinRegistryVatOwner(''); }} className="border border-slate-300 rounded-lg p-2.5 text-xs uppercase bg-white outline-hidden focus:ring-2 focus:ring-indigo-500" />
                <input type="text" placeholder="ADDRESS" value={tinRegistryAddress} onChange={(e) => setTinRegistryAddress(e.target.value)} className="border border-slate-300 rounded-lg p-2.5 text-xs uppercase bg-white outline-hidden focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div className="flex gap-2 mt-3">
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold">{editingTinRegistryId ? 'SAVE CHANGES' : 'SAVE TO TIN REGISTRY'}</button>
                <button type="button" onClick={() => { resetTinRegistryForm(); setShowTinRegisterForm(false); }} className="border border-slate-300 bg-white px-4 py-2 rounded-lg text-xs font-bold text-slate-700">CANCEL</button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left border-collapse text-xs">
              <thead><tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <th className="p-3 border border-slate-200">TIN</th><th className="p-3 border border-slate-200">VAT OWNER</th><th className="p-3 border border-slate-200">NON VAT OWNER</th><th className="p-3 border border-slate-200">ADDRESS</th><th className="p-3 border border-slate-200 text-center">Action</th>
              </tr></thead>
              <tbody>
                {tinRegistry.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-semibold border border-slate-200">No TIN records registered.</td></tr> : tinRegistry.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 border border-slate-200 font-bold font-mono">{item.tin}</td><td className="p-3 border border-slate-200 font-semibold">{item.vatOwner}</td><td className="p-3 border border-slate-200 font-semibold">{item.nonVatOwner}</td><td className="p-3 border border-slate-200">{item.address}</td>
                    <td className="p-2 border border-slate-200"><div className="flex justify-center gap-2"><button type="button" onClick={() => startEditTinRegistry(item)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-[10px] font-bold">Edit</button><button type="button" onClick={() => handleDeleteTinRegistry(item)} className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-md text-[10px] font-bold">Delete</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          11. CHART OF ACCOUNTS
      ======================================================== */}

      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full max-w-[1500px] mx-auto">

          <h2 className="text-base font-bold mb-4 text-slate-900">
            Manage Chart of Accounts
          </h2>

          <form
            onSubmit={
              handleAddAccount
            }
            className="flex gap-2 mb-6"
          >

            <input
              type="text"
              placeholder="ACCOUNT TITLE"
              value={
                newAccountName
              }
              onChange={(e) =>
                setNewAccountName(
                  e.target.value
                )
              }
              className="flex-1 border border-slate-300 rounded-lg p-2.5 text-xs font-bold uppercase bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
              required
            />

            <select
              value={
                newAccountType
              }
              onChange={(e) =>
                setNewAccountType(
                  e.target
                    .value as AccountType
                )
              }
              className="border border-slate-300 rounded-lg p-2.5 text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
            >

              <option value="Asset">
                Asset
              </option>

              <option value="Liability">
                Liability
              </option>

              <option value="Equity">
                Equity
              </option>

              <option value="Income">
                Income
              </option>

              <option value="Expense">
                Expense
              </option>

            </select>

            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
            >
              Add
            </button>

          </form>

          {editingAccountId && (
            <form
              onSubmit={handleSaveAccountEdit}
              className="mb-5 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-indigo-950">
                    Edit Account
                  </h3>
                  <p className="mt-0.5 text-[10px] text-indigo-700">
                    Updating the account title also updates its existing transaction references.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={cancelEditAccount}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
                <input
                  type="text"
                  value={editingAccountName}
                  onChange={(e) =>
                    setEditingAccountName(e.target.value)
                  }
                  className="rounded-lg border border-slate-300 bg-white p-2.5 text-xs font-bold uppercase outline-hidden focus:ring-2 focus:ring-indigo-500"
                  placeholder="ACCOUNT TITLE"
                  required
                />

                <select
                  value={editingAccountType}
                  onChange={(e) =>
                    setEditingAccountType(
                      e.target.value as AccountType
                    )
                  }
                  className="rounded-lg border border-slate-300 bg-white p-2.5 text-xs font-bold outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Asset">Asset</option>
                  <option value="Liability">Liability</option>
                  <option value="Equity">Equity</option>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>

                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-left border-collapse text-xs table-fixed">

              <thead>

                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">

                  <th className="p-3 border border-slate-200 w-auto">
                    Account Title
                  </th>

                  <th className="p-3 border border-slate-200 w-[260px]">
                    Category
                  </th>

                  <th className="p-3 border border-slate-200 w-[420px]">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {accounts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-6 border border-slate-200 text-center text-slate-400 font-semibold"
                    >
                      No accounts available.
                    </td>
                  </tr>
                ) : (
                  accounts.map(
                    (acc, index) => (
                      <tr
                        key={acc.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >

                        <td className="p-3 border border-slate-200 font-bold text-slate-900 whitespace-nowrap">
                          {acc.name}
                        </td>

                        <td className="p-3 border border-slate-200 text-slate-500 font-semibold whitespace-nowrap">
                          {acc.type}
                        </td>

                        <td className="p-2 border border-slate-200">
                          <div className="flex flex-nowrap items-center gap-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => startEditAccount(acc)}
                              className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-indigo-700"
                              title="Edit account"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteAccount(acc)
                              }
                              className="rounded-md bg-rose-600 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-rose-700"
                              title="Delete account"
                            >
                              Delete
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                moveAccount(acc.id, 'up')
                              }
                              disabled={index === 0}
                              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                              title="Move account up"
                            >
                              ↑
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                moveAccount(acc.id, 'down')
                              }
                              disabled={
                                index === accounts.length - 1
                              }
                              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                              title="Move account down"
                            >
                              ↓
                            </button>
                          </div>
                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>
          </div>

        </div>
      )}

    </div>
  );
}