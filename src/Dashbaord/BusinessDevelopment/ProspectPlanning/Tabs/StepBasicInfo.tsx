import type { BasicInfo } from '../../../../Types/Types';
// TODO: Move inputClass and labelClass to a new file if needed
import { inputClass, labelClass } from './uiConstants';
import { CustomSelect } from '../../../../components/ui/CustomSelect';
import { useState } from 'react';

interface StepBasicInfoProps {
  data: BasicInfo;
  onChange: (field: keyof BasicInfo, value: string) => void;
  onNext: () => void;
  /** Create API only allows DRAFT / SUBMITTED; omit or 'edit' for full workflow statuses */
  formMode?: "create" | "edit";
}

const CAMEROON_REGIONS = [
  { value: "littoral", label: "Littoral" },
  { value: "centre", label: "Centre" },
  { value: "ouest", label: "West" },
  { value: "nord_ouuest", label: "North West" },
  { value: "sud_ouuest", label: "South West" },
  { value: "other", label: "Other (Specify)" },
];

const CITIES_BY_REGION: Record<string, { value: string; label: string }[]> = {
  littoral: [
    { value: "douala", label: "Douala" },
    { value: "douala_bali", label: "Douala Bali" },
    { value: "douala_bekoko", label: "Douala Bekoko" },
    { value: "douala_bonadikombo", label: "Douala Bonadikombo" },
    { value: "douala_bonapriso", label: "Douala Bonapriso" },
    { value: "douala_bonassama", label: "Douala Bonassama" },
    { value: "douala_deido", label: "Douala Deido" },
    { value: "douala_dibombari", label: "Douala Dibombari" },
    { value: "douala_kingtom", label: "Douala Kingtom" },
    { value: "douala_logbaba", label: "Douala Logbaba" },
    { value: "douala_makepe", label: "Douala Makepe" },
    { value: "douala_mbankolo", label: "Douala Mbankolo" },
    { value: "douala_new_bell", label: "Douala New Bell" },
    { value: "douala_ndogbong", label: "Douala Ndogbong" },
    { value: "douala_nkom", label: "Douala Nkom" },
    { value: "douala_ntone", label: "Douala Ntone" },
    { value: "douala_akwa", label: "Douala Akwa" },
    { value: "other", label: "Other (Specify)" },
  ],
  centre: [
    { value: "yaounde", label: "Yaoundé" },
    { value: "yaounde_akok", label: "Yaoundé Akok" },
    { value: "yaounde_anzu", label: "Yaoundé Anzu" },
    { value: "yaounde_bolo", label: "Yaoundé Bolo" },
    { value: "yaounde_cite_verte", label: "Yaoundé Cité Verte" },
    { value: "yaounde_doa", label: "Yaoundé DOA" },
    { value: "yaounde_ekoudou", label: "Yaoundé Ekoudou" },
    { value: "yaounde_elig_essoa", label: "Yaoundé Elig Essoa" },
    { value: "yaounde_etoa", label: "Yaoundé Etoa" },
    { value: "yaounde_mimboman", label: "Yaoundé Mimboman" },
    { value: "yaounde_nkol_afame", label: "Yaoundé Nkol Afame" },
    { value: "yaounde_nkol_beton", label: "Yaoundé Nkol Beton" },
    { value: "yaounde_nkol_guemon", label: "Yaoundé Nkol Guemon" },
    { value: "yaounde_nkol_messass", label: "Yaoundé Nkol Messass" },
    { value: "yaounde_nkoldongo", label: "Yaoundé Nkoldongo" },
    { value: "yaounde_nsam", label: "Yaoundé Nsam" },
    { value: "yaounde_odza", label: "Yaoundé Odza" },
    { value: "yaounde_og压", label: "Yaoundé Oyom" },
    { value: "yaounde_simbock", label: "Yaoundé Simbock" },
    { value: "eboko", label: "Eboko" },
    { value: "mbalmayo", label: "Mbalmayo" },
    { value: "benguela", label: "Benguela" },
    { value: "other", label: "Other (Specify)" },
  ],
  ouest: [
    { value: "bafoussam", label: "Bafoussam" },
    { value: "dschang", label: "Dschang" },
    { value: "foumban", label: "Foumban" },
    { value: "foumbot", label: "Foumbot" },
    { value: "bangangte", label: "Bangangté" },
    { value: "batie", label: "Batié" },
    { value: "bandjoun", label: "Bandjoun" },
    { value: "bansoa", label: "Bansoa" },
    { value: "bati", label: "Bati" },
    { value: "baham", label: "Baham" },
    { value: "bakha", label: "Bakha" },
    { value: "baleng", label: "Baleng" },
    { value: "bame", label: "Bamé" },
    { value: "batchingou", label: "Batchingou" },
    { value: "bayangam", label: "Bayangam" },
    { value: "bazen", label: "Bazou" },
    { value: "bibian", label: "Bibian" },
    { value: "bikou", label: "Bikou" },
    { value: "bissa", label: "Bissa" },
    { value: "bodomon", label: "Bodomon" },
    { value: "bok", label: "Bok" },
    { value: "bonadap", label: "Bonadap" },
    { value: "bonafos", label: "Bonafos" },
    { value: "chou", label: "Chou" },
    { value: "djombi", label: "Djombi" },
    { value: "douala", label: "Douala" },
    { value: "fokoue", label: "Fokoué" },
    { value: "fombap", label: "Fombap" },
    { value: "fongo_tongo", label: "Fongo Tongo" },
    { value: "galim", label: "Galim" },
    { value: "goumti", label: "Goumti" },
    { value: "kack", label: "Kack" },
    { value: "kaffe", label: "Kaffé" },
    { value: "keung", label: "Keung" },
    { value: "kikoi", label: "Kikoi" },
    { value: "kouoptamo", label: "Kouoptamo" },
    { value: "koutaba", label: "Koutaba" },
    { value: "kouwo", label: "Kouwo" },
    { value: "lenegue", label: "Léngué" },
    { value: "madjingo", label: "Madjingo" },
    { value: "madjou", label: "Madjou" },
    { value: "mamfe", label: "Mamfe" },
    { value: "manda", label: "Manda" },
    { value: "massong", label: "Massong" },
    { value: "mbatimack", label: "Mbatimack" },
    { value: "mbe", label: "Mbé" },
    { value: "mbiame", label: "Mbiame" },
    { value: "mbo", label: "Mbo" },
    { value: "mboda", label: "Mbouda" },
    { value: "mouanko", label: "Mouanko" },
    { value: "ndah_croi", label: "Ndah-Croi" },
    { value: "ndanga", label: "Ndanga" },
    { value: "ndom", label: "Ndom" },
    { value: "ndong_essok", label: "Ndong-Essok" },
    { value: "ngog_bas", label: "Ngog-Bass" },
    { value: "ntchy", label: "Ntchy" },
    { value: "penka_martin", label: "Penka Martin" },
    { value: "pouma", label: "Pouma" },
    { value: "sou", label: "Sou" },
    { value: "tonga", label: "Tonga" },
    { value: "yaoundé", label: "Yaoundé" },
    { value: "other", label: "Other (Specify)" },
  ],
  nord_ouuest: [
    { value: "bamenda", label: "Bamenda" },
    { value: "kumbo", label: "Kumbo" },
    { value: "fundong", label: "Fundong" },
    { value: "wum", label: "Wum" },
    { value: "ndop", label: "Ndop" },
    { value: "bafut", label: "Bafut" },
    { value: "babanki", label: "Babanki" },
    { value: "belo", label: "Belo" },
    { value: "ngok_tukum", label: "Ngok-Tukum" },
    { value: "njinikom", label: "Njinikom" },
    { value: "njap", label: "Njap" },
    { value: "batibo", label: "Batibo" },
    { value: "widikum", label: "Widikum" },
    { value: "mamfe", label: "Mamfe" },
    { value: "akwaya", label: "Akwaya" },
    { value: "other", label: "Other (Specify)" },
  ],
  sud_ouuest: [
    { value: "limbe", label: "Limbe" },
    { value: "buea", label: "Buea" },
    { value: "kumba", label: "Kumba" },
    { value: "mamfe", label: "Mamfe" },
    { value: "tiko", label: "Tiko" },
    { value: "idab", label: "Idab" },
    { value: "mutengene", label: "Mutengene" },
    { value: "bonadikombo", label: "Bonadikombo" },
    { value: "milehi", label: "Milehi" },
    { value: "bolifamba", label: "Bolifamba" },
    { value: "bova", label: "Bova" },
    { value: "kuke", label: "Kuke" },
    { value: "lwambe", label: "Lwambe" },
    { value: "other", label: "Other (Specify)" },
  ],
  other: [
    { value: "other", label: "Other (Specify)" },
  ],
};

const getCitiesForRegion = (region: string): { value: string; label: string }[] => {
  return CITIES_BY_REGION[region] || CITIES_BY_REGION.littoral;
};

export function StepBasicInfo({
  data,
  onChange,
  onNext,
  formMode = "edit",
}: StepBasicInfoProps) {
  const [showCityInput, setShowCityInput] = useState(false);
  const [showRegionInput, setShowRegionInput] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const [manualRegion, setManualRegion] = useState('');

  const statusSelectOptions =
    formMode === "create"
      ? [
          { value: "DRAFT", label: "Draft" },
          { value: "SUBMITTED", label: "Submitted" },
        ]
      : [
          { value: "DRAFT", label: "Draft" },
          { value: "SUBMITTED", label: "Submitted" },
          { value: "PENDING", label: "Pending" },
          { value: "ACTIVE", label: "Active" },
          { value: "COMPLETED", label: "Completed" },
          { value: "REJECTED", label: "Rejected" },
          { value: "CANCELLED", label: "Cancelled" },
        ];

  const availableCities = getCitiesForRegion(data.region);

  const handleRegionChange = (value: string) => {
    setShowRegionInput(value === 'other');
    if (value !== 'other') {
      onChange('region', value);
      onChange('city', '');
      setShowCityInput(false);
      setManualCity('');
    }
  };

  const handleRegionManualChange = (value: string) => {
    setManualRegion(value);
    onChange('region', value);
  };

  const handleCityChange = (value: string) => {
    setShowCityInput(value === 'other');
    if (value !== 'other') {
      onChange('city', value);
    }
  };

  const handleCityManualChange = (value: string) => {
    setManualCity(value);
    onChange('city', value);
  };

  const handleRegionBlur = () => {
    if (manualRegion.trim()) {
      onChange('region', manualRegion.trim());
    }
  };

  const handleCityBlur = () => {
    if (manualCity.trim()) {
      onChange('city', manualCity.trim());
    }
  };

  const isBasicInfoValid = (() => {
    const hasRequiredText =
      data.title.trim().length >= 3 &&
      data.description.trim().length > 0 &&
      data.region.trim().length > 0 &&
      data.city.trim().length > 0 &&
      data.targetAudience.trim().length > 0 &&
      data.status.trim().length > 0;

    if (!hasRequiredText || !data.startDate || !data.endDate) {
      return false;
    }

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return false;
    }

    return start < end;
  })();

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-6 flex flex-col gap-3 sm:gap-5">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
        <h2 className="text-sm sm:text-base font-semibold text-gray-800">Basic Information</h2>
      </div>

      {/* Title */}
      <div>
        <label className={labelClass}>
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className={inputClass}
          placeholder="e.g., Douala Industrial Zone Prospection"
          maxLength={255}
          value={data.title}
          onChange={(e) => onChange("title", e.target.value)}
        />
        <p className="text-right text-xs text-gray-400 mt-1">{data.title.length}/255</p>
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          className={`${inputClass} resize-none h-16 sm:h-24`}
          placeholder="Describe the prospection objectives and target audience"
          maxLength={1000}
          value={data.description}
          onChange={(e) => onChange("description", e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-1">{data.description.length}/1000</p>
      </div>

      {/* City + Region */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        <div>
          <label className={labelClass}>
            Region <span className="text-red-500">*</span>
          </label>
          {showRegionInput ? (
            <div className="space-y-2">
              <input
                type="text"
                className={inputClass}
                placeholder="Enter region name"
                value={manualRegion}
                onChange={(e) => handleRegionManualChange(e.target.value)}
                onBlur={handleRegionBlur}
              />
              <button
                type="button"
                onClick={() => {
                  setShowRegionInput(false);
                  onChange('region', manualRegion.trim() || '');
                }}
                className="text-xs text-primary hover:underline"
              >
                Select from list
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <CustomSelect
                options={CAMEROON_REGIONS}
                value={data.region}
                onChange={handleRegionChange}
                placeholder="Select region"
              />
              {data.region && (
                <button
                  type="button"
                  onClick={() => setShowRegionInput(true)}
                  className="text-xs text-gray-500 hover:text-primary"
                >
                  Enter manually
                </button>
              )}
            </div>
          )}
        </div>
        <div>
          <label className={labelClass}>
            City <span className="text-red-500">*</span>
          </label>
          {showCityInput ? (
            <div className="space-y-2">
              <input
                type="text"
                className={inputClass}
                placeholder="Enter city name"
                value={manualCity}
                onChange={(e) => handleCityManualChange(e.target.value)}
                onBlur={handleCityBlur}
              />
              <button
                type="button"
                onClick={() => {
                  setShowCityInput(false);
                  onChange('city', manualCity.trim() || '');
                }}
                className="text-xs text-primary hover:underline"
              >
                Select from list
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <CustomSelect
                options={availableCities}
                value={data.city}
                onChange={handleCityChange}
                placeholder="Select city"
                disabled={!data.region}
              />
              {data.region && (
                <button
                  type="button"
                  onClick={() => setShowCityInput(true)}
                  className="text-xs text-gray-500 hover:text-primary"
                >
                  Enter manually
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Venue */}
      <div>
        <label className={labelClass}>Venue</label>
        <input
          type="text"
          className={inputClass}
          placeholder="e.g., Convention Center"
          value={data.venue}
          onChange={(e) => onChange("venue", e.target.value)}
        />
      </div>

      {/* Address */}
      <div>
        <label className={labelClass}>Address</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Full address"
          value={data.address}
          onChange={(e) => onChange("address", e.target.value)}
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        <div>
          <label className={labelClass}>
            Planned Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className={inputClass}
            value={data.startDate}
            onChange={(e) => onChange("startDate", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>
            Planned End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className={inputClass}
            value={data.endDate}
            onChange={(e) => onChange("endDate", e.target.value)}
          />
        </div>
      </div>

      {/* Target Audience + Expected Contacts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        <div>
          <label className={labelClass}>
            Target Audience <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g., Manufacturing companies, SMEs"
            value={data.targetAudience}
            onChange={(e) => onChange("targetAudience", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Expected Contacts</label>
          <input
            type="number"
            className={inputClass}
            placeholder="0"
            min={0}
            value={data.expectedContacts}
            onChange={(e) => onChange("expectedContacts", e.target.value)}
          />
        </div>
      </div>

      {/* Success Criteria */}
      <div>
        <label className={labelClass}>Success Criteria</label>
        <textarea
          className={`${inputClass} resize-none h-12 sm:h-20`}
          placeholder="Define what success looks like for this prospection"
          value={data.successCriteria}
          onChange={(e) => onChange("successCriteria", e.target.value)}
        />
      </div>

      {/* Status */}
      <div>
        <label className={labelClass}>
          Status <span className="text-red-500">*</span>
        </label>
        <CustomSelect
          options={statusSelectOptions}
          value={data.status || 'DRAFT'}
          onChange={(value) => onChange("status", value)}
        />
        <p className="text-xs text-gray-500 mt-1">
          {data.status === 'DRAFT' && 'Draft prospections can be edited freely. Submit when ready for approval.'}
          {data.status === 'SUBMITTED' && 'Submitted prospections await manager approval.'}
          {data.status === 'PENDING' && 'Approved - waiting for start date to become active.'}
          {data.status === 'ACTIVE' && 'Active prospection in progress.'}
          {data.status === 'COMPLETED' && 'Prospection completed.'}
          {data.status === 'REJECTED' && 'Prospection was rejected by manager.'}
        </p>
      </div>

      {/* Footer */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onNext}
          disabled={!isBasicInfoValid}
          className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
            isBasicInfoValid
              ? "bg-primary text-white hover:bg-primary/80"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
